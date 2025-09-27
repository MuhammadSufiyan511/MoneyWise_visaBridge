<script>
  import { user } from '$lib/stores/user';
  import { onMount, onDestroy } from 'svelte';
  import { transactions, startTransactions, stopTransactions, removeTransaction, editTransaction } from '$lib/stores/transactions';

  // currentUser holds the signed-in user
  let currentUser = null;
  const unsubUser = user.subscribe(v => currentUser = v);

  // transactionsArr will be populated by the transactions store
  let transactionsArr = [];
  const unsubTx = transactions.subscribe(v => transactionsArr = v);

  // Filter and sort state
  let filterType = 'all';
  let sortBy = 'date';
  let searchQuery = '';
  let showEditModal = false;
  let editingTransaction = null;

  onMount(() => {
    if (currentUser) startTransactions(currentUser.uid);
  });

  onDestroy(() => {
    unsubUser();
    unsubTx();
    stopTransactions();
  });

  // Filtered and sorted transactions
  $: filteredTransactions = transactionsArr
    .filter(t => {
      if (filterType !== 'all' && t.type !== filterType) return false;
      if (searchQuery && !t.category?.toLowerCase().includes(searchQuery.toLowerCase()) && 
          !t.notes?.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'date') return new Date(b.date) - new Date(a.date);
      if (sortBy === 'amount') return Number(b.amount) - Number(a.amount);
      return 0;
    });

  // Statistics
  $: totalIncome = transactionsArr.filter(t => t.type === 'income').reduce((s, t) => s + Number(t.amount), 0);
  $: totalExpenses = transactionsArr.filter(t => t.type === 'expense').reduce((s, t) => s + Number(t.amount), 0);
  
  // Category breakdown for expenses
  $: categoryBreakdown = transactionsArr
    .filter(t => t.type === 'expense' && t.category)
    .reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + Number(t.amount);
      return acc;
    }, {});

  async function del(id) {
    if (!confirm('Delete this transaction?')) return;
    try {
      await removeTransaction(currentUser.uid, id);
    } catch (e) {
      alert('Delete failed: ' + (e.message || e));
    }
  }

  function openEditModal(transaction) {
    editingTransaction = { ...transaction };
    showEditModal = true;
  }

  async function saveEdit() {
    try {
      await editTransaction(currentUser.uid, editingTransaction.id, {
        amount: Number(editingTransaction.amount),
        category: editingTransaction.category,
        notes: editingTransaction.notes,
        type: editingTransaction.type
      });
      showEditModal = false;
      editingTransaction = null;
    } catch (e) {
      alert('Edit failed: ' + (e.message || e));
    }
  }

  function cancelEdit() {
    showEditModal = false;
    editingTransaction = null;
  }

  // Chart data for category breakdown
  $: chartData = Object.entries(categoryBreakdown)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5)
    .map(([category, amount]) => ({
      category,
      amount,
      percentage: ((amount / totalExpenses) * 100).toFixed(1)
    }));
</script>

<div class="space-y-6">
  <!-- Header with Stats -->
  <div class="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-6 text-white">
    <h2 class="text-2xl font-bold mb-4">Transaction Overview</h2>
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div class="bg-white bg-opacity-20 rounded-xl p-4">
        <div class="text-sm opacity-90">Total Transactions</div>
        <div class="text-2xl font-bold">{transactionsArr.length}</div>
      </div>
      <div class="bg-white bg-opacity-20 rounded-xl p-4">
        <div class="text-sm opacity-90">This Month Income</div>
        <div class="text-2xl font-bold text-green-300">+${totalIncome.toFixed(2)}</div>
      </div>
      <div class="bg-white bg-opacity-20 rounded-xl p-4">
        <div class="text-sm opacity-90">This Month Expenses</div>
        <div class="text-2xl font-bold text-red-300">-${totalExpenses.toFixed(2)}</div>
      </div>
    </div>
  </div>

  <!-- Charts Section -->
  {#if chartData.length > 0}
    <div class="bg-white rounded-2xl shadow-lg border border-slate-100 p-6">
      <h3 class="text-xl font-semibold text-slate-800 mb-6">Top Expense Categories</h3>
      <div class="space-y-4">
        {#each chartData as item}
          <div class="flex items-center justify-between">
            <div class="flex-1">
              <div class="flex items-center justify-between mb-1">
                <span class="font-medium text-slate-700">{item.category}</span>
                <span class="text-sm text-slate-500">{item.percentage}%</span>
              </div>
              <div class="w-full bg-slate-200 rounded-full h-2">
                <div 
                  class="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-500" 
                  style="width: {item.percentage}%"
                ></div>
              </div>
            </div>
            <div class="ml-4 text-right">
              <span class="font-semibold text-slate-800">${item.amount.toFixed(2)}</span>
            </div>
          </div>
        {/each}
      </div>
    </div>
  {/if}

  <!-- Filters and Search -->
  <div class="bg-white rounded-2xl shadow-lg border border-slate-100 p-6">
    <div class="flex flex-col md:flex-row gap-4 mb-6">
      <div class="flex-1">
        <label class="block text-sm font-medium text-slate-700 mb-2">Search</label>
        <div class="relative">
          <input 
            bind:value={searchQuery}
            type="text" 
            placeholder="Search by category or notes..."
            class="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          <svg class="absolute left-3 top-2.5 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
          </svg>
        </div>
      </div>
      
      <div>
        <label class="block text-sm font-medium text-slate-700 mb-2">Filter by Type</label>
        <select 
          bind:value={filterType}
          class="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="all">All Transactions</option>
          <option value="income">Income Only</option>
          <option value="expense">Expenses Only</option>
        </select>
      </div>
      
      <div>
        <label class="block text-sm font-medium text-slate-700 mb-2">Sort by</label>
        <select 
          bind:value={sortBy}
          class="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="date">Date (Newest)</option>
          <option value="amount">Amount (Highest)</option>
        </select>
      </div>
    </div>

    <!-- Transaction List -->
    {#if filteredTransactions.length === 0}
      <div class="text-center py-12">
        <svg class="mx-auto w-16 h-16 text-slate-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
        </svg>
        <p class="text-slate-500 text-lg">No transactions found</p>
        <p class="text-slate-400 text-sm mt-1">Try adjusting your filters or add a new transaction</p>
      </div>
    {:else}
      <div class="space-y-3">
        {#each filteredTransactions as t}
          <div class="flex items-center justify-between p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-all duration-200 border border-transparent hover:border-slate-200">
            <div class="flex items-center space-x-4">
              <div class="p-3 rounded-lg {t.type === 'income' ? 'bg-green-100' : 'bg-red-100'}">
                {#if t.type === 'income'}
                  <svg class="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 11l5-5m0 0l5 5m-5-5v12"/>
                  </svg>
                {:else}
                  <svg class="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 13l-5 5m0 0l-5-5m5 5V6"/>
                  </svg>
                {/if}
              </div>
              
              <div>
                <div class="font-semibold text-slate-800">
                  {t.category || t.type.charAt(0).toUpperCase() + t.type.slice(1)}
                </div>
                <div class="text-sm text-slate-500">
                  {new Date(t.date).toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'short', 
                    day: 'numeric' 
                  })}
                </div>
                {#if t.notes}
                  <div class="text-sm text-slate-400 mt-1">{t.notes}</div>
                {/if}
              </div>
            </div>
            
            <div class="flex items-center space-x-4">
              <div class="text-right">
                <div class="font-bold text-lg {t.type === 'income' ? 'text-green-600' : 'text-red-600'}">
                  {t.type === 'income' ? '+' : '-'}${Number(t.amount).toFixed(2)}
                </div>
              </div>
              
              <div class="flex space-x-2">
                <button 
                  on:click={() => openEditModal(t)}
                  class="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  title="Edit transaction"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                  </svg>
                </button>
                <button 
                  on:click={() => del(t.id)}
                  class="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="Delete transaction"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                  </svg>
                </button>
              </div>
            </div>
          </div>
        {/each}
      </div>
    {/if}
  </div>
</div>

<!-- Edit Modal -->
{#if showEditModal && editingTransaction}
  <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
    <div class="bg-white rounded-2xl p-6 w-full max-w-md">
      <h3 class="text-xl font-semibold text-slate-800 mb-4">Edit Transaction</h3>
      
      <div class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-slate-700 mb-1">Amount</label>
          <input 
            bind:value={editingTransaction.amount}
            type="number" 
            step="0.01"
            class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        
        <div>
          <label class="block text-sm font-medium text-slate-700 mb-1">Type</label>
          <select 
            bind:value={editingTransaction.type}
            class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="expense">Expense</option>
            <option value="income">Income</option>
          </select>
        </div>
        
        <div>
          <label class="block text-sm font-medium text-slate-700 mb-1">Category</label>
          <input 
            bind:value={editingTransaction.category}
            type="text"
            class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        
        <div>
          <label class="block text-sm font-medium text-slate-700 mb-1">Notes</label>
          <textarea 
            bind:value={editingTransaction.notes}
            class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            rows="3"
          ></textarea>
        </div>
      </div>
      
      <div class="flex justify-end space-x-3 mt-6">
        <button 
          on:click={cancelEdit}
          class="px-4 py-2 text-slate-600 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
        >
          Cancel
        </button>
        <button 
          on:click={saveEdit}
          class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Save Changes
        </button>
      </div>
    </div>
  </div>
{/if}