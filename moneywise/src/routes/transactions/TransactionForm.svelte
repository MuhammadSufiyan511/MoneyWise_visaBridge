<script>
  import { addTransaction } from '$lib/stores/transactions';
  export let user = null;

  let amount = '';
  let date = new Date().toISOString().slice(0,10);
  let type = 'expense';
  let category = '';
  let notes = '';
  let error = '';
  let isSubmitting = false;

  // Predefined categories for better UX
  const expenseCategories = [
    'Food & Dining', 'Transportation', 'Shopping', 'Entertainment', 
    'Bills & Utilities', 'Healthcare', 'Travel', 'Education', 'Other'
  ];
  
  const incomeCategories = [
    'Salary', 'Freelance', 'Investment', 'Gift', 'Bonus', 'Other'
  ];

  $: availableCategories = type === 'expense' ? expenseCategories : incomeCategories;

  async function submit() {
    error = '';
    isSubmitting = true;
    
    if (!user) { 
      error = 'Please login'; 
      isSubmitting = false;
      return; 
    }
    
    if (!amount || Number(amount) <= 0) {
      error = 'Please enter a valid amount';
      isSubmitting = false;
      return;
    }
    
    try {
      await addTransaction(user.uid, {
        amount: Number(amount),
        date,
        type,
        category: category || (type === 'expense' ? 'Other' : 'Other'),
        notes
      });
      
      // Reset fields with success animation
      amount = '';
      category = '';
      notes = '';
      
      // Show success message briefly
      const successMsg = document.createElement('div');
      successMsg.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 transform transition-all duration-300';
      successMsg.textContent = 'Transaction added successfully!';
      document.body.appendChild(successMsg);
      
      setTimeout(() => {
        successMsg.style.transform = 'translateX(400px)';
        setTimeout(() => document.body.removeChild(successMsg), 300);
      }, 2000);
      
    } catch (e) {
      error = e.message || 'Failed to add transaction';
    }
    
    isSubmitting = false;
  }
</script>

<div class="bg-white rounded-2xl shadow-lg border border-slate-100 p-6">
  <div class="flex items-center mb-6">
    <div class="p-3 bg-blue-100 rounded-lg mr-4">
      <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
      </svg>
    </div>
    <div>
      <h2 class="text-2xl font-semibold text-slate-800">Add New Transaction</h2>
      <p class="text-slate-600">Track your income and expenses</p>
    </div>
  </div>

  <form on:submit|preventDefault={submit} class="space-y-6">
    <!-- Amount and Type Row -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <label class="block text-sm font-medium text-slate-700 mb-2">
          Amount <span class="text-red-500">*</span>
        </label>
        <div class="relative">
          <span class="absolute left-3 top-3 text-slate-500">$</span>
          <input 
            bind:value={amount} 
            type="number" 
            step="0.01" 
            min="0"
            placeholder="0.00"
            class="w-full pl-8 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg font-medium"
            required 
          />
        </div>
      </div>

      <div>
        <label class="block text-sm font-medium text-slate-700 mb-2">Transaction Type</label>
        <div class="grid grid-cols-2 gap-2">
          <label class="relative">
            <input 
              type="radio" 
              bind:group={type} 
              value="expense"
              class="sr-only"
            />
            <div class="p-3 border-2 rounded-lg cursor-pointer transition-all text-center font-medium
              {type === 'expense' ? 'border-red-500 bg-red-50 text-red-700' : 'border-slate-300 hover:border-red-300'}">
              <svg class="w-5 h-5 mx-auto mb-1 {type === 'expense' ? 'text-red-600' : 'text-slate-400'}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 13l-5 5m0 0l-5-5m5 5V6"/>
              </svg>
              Expense
            </div>
          </label>
          <label class="relative">
            <input 
              type="radio" 
              bind:group={type} 
              value="income"
              class="sr-only"
            />
            <div class="p-3 border-2 rounded-lg cursor-pointer transition-all text-center font-medium
              {type === 'income' ? 'border-green-500 bg-green-50 text-green-700' : 'border-slate-300 hover:border-green-300'}">
              <svg class="w-5 h-5 mx-auto mb-1 {type === 'income' ? 'text-green-600' : 'text-slate-400'}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 11l5-5m0 0l5 5m-5-5v12"/>
              </svg>
              Income
            </div>
          </label>
        </div>
      </div>
    </div>

    <!-- Date and Category Row -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <label class="block text-sm font-medium text-slate-700 mb-2">Date</label>
        <input 
          type="date" 
          bind:value={date} 
          class="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
          required 
        />
      </div>

      <div>
        <label class="block text-sm font-medium text-slate-700 mb-2">Category</label>
        <select 
          bind:value={category} 
          class="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="">Select a category...</option>
          {#each availableCategories as cat}
            <option value={cat}>{cat}</option>
          {/each}
        </select>
      </div>
    </div>

    <!-- Notes -->
    <div>
      <label class="block text-sm font-medium text-slate-700 mb-2">Notes (Optional)</label>
      <textarea 
        bind:value={notes} 
        placeholder="Add any additional details..."
        class="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
        rows="3"
      ></textarea>
    </div>

    <!-- Submit Button -->
    <div class="flex justify-end pt-4 border-t border-slate-200">
      <button 
        type="submit"
        disabled={isSubmitting}
        class="flex items-center px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium 
               hover:from-blue-700 hover:to-purple-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 
               disabled:opacity-50 disabled:cursor-not-allowed transform transition-all duration-200 hover:scale-105"
      >
        {#if isSubmitting}
          <svg class="animate-spin w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Adding...
        {:else}
          <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
          </svg>
          Add Transaction
        {/if}
      </button>
    </div>

    <!-- Error Message -->
    {#if error}
      <div class="flex items-center p-4 bg-red-50 border border-red-200 rounded-lg">
        <svg class="w-5 h-5 text-red-500 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
        </svg>
        <p class="text-red-700 font-medium">{error}</p>
      </div>
    {/if}
  </form>

  <!-- Quick Actions -->
  <div class="mt-8 pt-6 border-t border-slate-200">
    <h3 class="text-lg font-medium text-slate-800 mb-4">Quick Add</h3>
    <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
      <button 
        on:click={() => { type = 'expense'; category = 'Food & Dining'; amount = '15.00'; }}
        class="p-3 bg-orange-50 text-orange-700 rounded-lg hover:bg-orange-100 transition-colors text-sm font-medium"
      >
        🍕 Lunch $15
      </button>
      <button 
        on:click={() => { type = 'expense'; category = 'Transportation'; amount = '5.00'; }}
        class="p-3 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium"
      >
        🚌 Transit $5
      </button>
      <button 
        on:click={() => { type = 'expense'; category = 'Shopping'; amount = '50.00'; }}
        class="p-3 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition-colors text-sm font-medium"
      >
        🛒 Shopping $50
      </button>
      <button 
        on:click={() => { type = 'income'; category = 'Other'; amount = '100.00'; }}
        class="p-3 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors text-sm font-medium"
      >
        💰 Income $100
      </button>
    </div>
  </div>
</div>

<style>
  .sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
  }
</style>