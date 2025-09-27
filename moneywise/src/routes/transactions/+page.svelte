<script>
  import TransactionForm from './TransactionForm.svelte';
  import TransactionList from './TransactionList.svelte';
  import { user } from '$lib/stores/user';
</script>

<section class="grid md:grid-cols-1 gap-6">
  <div>
    <h3 class="text-lg font-semibold mb-3">Add transaction</h3>
    <TransactionForm user={$user} />
  </div>
  <div>
    <h3 class="text-lg font-semibold mb-3">Recent transactions</h3>
    <TransactionList user={$user} />
  </div>
</section>
