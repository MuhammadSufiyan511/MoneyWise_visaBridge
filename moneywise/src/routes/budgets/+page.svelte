<script>
import BudgetForm from './BudgetForm.svelte';
import BudgetList from './BudgetList.svelte';
import { user } from '$lib/stores/user';
import { startBudgets, stopBudgets } from '../../lib/stores/budget';
// No need to manually subscribe, use $user in the template
</script>


<section class="grid md:grid-cols-2 gap-6">
<div>
<h3 class="text-lg font-semibold mb-3">Add / Edit budget</h3>
<BudgetForm user={$user} />
</div>
<div>
<h3 class="text-lg font-semibold mb-3">Budgets</h3>
<BudgetList user={$user} />
</div>
</section>