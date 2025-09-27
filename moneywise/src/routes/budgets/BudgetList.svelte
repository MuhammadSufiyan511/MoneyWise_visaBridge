<!-- src/lib/components/BudgetsList.svelte -->
<script>
  import { budgets, editBudget, removeBudget } from '../../lib/stores/budget';
  import { get } from 'svelte/store';
  import { user } from '$lib/stores/user';
  import { createEventDispatcher } from 'svelte';

  const dispatch = createEventDispatcher();

  // simple handler for delete
  async function handleDelete(b) {
    if (!confirm(`Delete budget for "${b.category}"?`)) return;
    const uid = get(user)?.uid;
    if (!uid) return alert('Not signed in');
    await removeBudget(uid, b.id);
    dispatch('deleted', b);
  }
</script>

{#if $budgets.length === 0}
  <div class="text-gray-600">No budgets found.</div>
{:else}
  <div class="space-y-3">
    {#each $budgets as b}
      <div class="p-3 bg-white rounded shadow flex items-center justify-between">
        <div>
          <div class="font-semibold">{b.category}</div>
          <div class="text-sm text-gray-500">{new Date(b.periodStart).toLocaleDateString()} — {new Date(b.periodEnd).toLocaleDateString()}</div>
          <div class="text-sm text-gray-700">{b.amount ? `$${b.amount}` : '-'}</div>
        </div>
        <div class="flex items-center space-x-2">
          <!-- implement editing if you want; for now we provide delete -->
          <button class="px-3 py-1 text-sm border rounded" on:click={() => handleDelete(b)}>Delete</button>
        </div>
      </div>
    {/each}
  </div>
{/if}
