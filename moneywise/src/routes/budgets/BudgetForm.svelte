<!-- src/lib/components/BudgetForm.svelte -->
<script>
  import { createEventDispatcher } from 'svelte';
  import { get } from 'svelte/store';
  import { user } from '$lib/stores/user';
  import { addBudget } from '$lib/stores/budget';

  const dispatch = createEventDispatcher();

  export let open = false; // control modal externally
  export let initial = null; // for editing later (optional)

  // form fields
  let category = initial?.category || '';
  let amount = initial?.amount ?? '';
  let periodStart = initial?.periodStart || defaultPeriodStart();
  let periodEnd = initial?.periodEnd || defaultPeriodEnd();
  let saving = false;
  let error = '';

  function defaultPeriodStart() {
    const d = new Date();
    d.setDate(1);
    return d.toISOString().slice(0,10);
  }
  function defaultPeriodEnd() {
    const d = new Date();
    d.setMonth(d.getMonth()+1);
    d.setDate(0); // last day previous month -> correct for month end
    return d.toISOString().slice(0,10);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    error = '';

    // basic validation
    if (!category || !amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      error = 'Please provide a valid category and positive amount.';
      return;
    }
    if (!periodStart || !periodEnd) {
      error = 'Please select a valid period.';
      return;
    }
    const uid = get(user)?.uid;
    if (!uid) {
      error = 'User not signed in';
      return;
    }

    saving = true;
    try {
      const payload = {
        category: category.trim(),
        amount: Number(amount),
        periodStart,
        periodEnd
      };
      const id = await addBudget(uid, payload);
      // dispatch an event so parent can react (e.g., close modal & show success)
      dispatch('created', { id, ...payload });
      open = false;
    } catch (err) {
      console.error('failed to add budget', err);
      error = err.message || 'Failed to add budget';
    } finally {
      saving = false;
    }
  }

  function handleClose() {
    open = false;
    dispatch('close');
  }
</script>

{#if open}
  <div class="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
    <div class="bg-white rounded-lg shadow-lg w-full max-w-md p-6">
      <h3 class="text-lg font-semibold mb-3">Create Budget</h3>
      <form on:submit|preventDefault={handleSubmit} class="space-y-3">
        <div>
          <label class="block text-sm text-gray-600">Category</label>
          <input class="w-full mt-1 p-2 border rounded" bind:value={category} placeholder="E.g. Groceries" />
        </div>

        <div>
          <label class="block text-sm text-gray-600">Amount (USD)</label>
          <input type="number" min="0" step="0.01" class="w-full mt-1 p-2 border rounded" bind:value={amount} />
        </div>

        <div class="grid grid-cols-2 gap-2">
          <div>
            <label class="block text-sm text-gray-600">Period start</label>
            <input type="date" class="w-full mt-1 p-2 border rounded" bind:value={periodStart} />
          </div>
          <div>
            <label class="block text-sm text-gray-600">Period end</label>
            <input type="date" class="w-full mt-1 p-2 border rounded" bind:value={periodEnd} />
          </div>
        </div>

        {#if error}
          <div class="text-red-600 text-sm">{error}</div>
        {/if}

        <div class="flex justify-end space-x-2">
          <button type="button" class="px-4 py-2 rounded border" on:click={handleClose}>Cancel</button>
          <button type="submit" class="px-4 py-2 rounded bg-indigo-600 text-white" disabled={saving}>
            {saving ? 'Saving...' : 'Save Budget'}
          </button>
        </div>
      </form>
    </div>
  </div>
{/if}

<style>
  /* tiny styles, adjust to your theme */
</style>
