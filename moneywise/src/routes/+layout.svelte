<script>
  import "../app.css";
  import { user } from "$lib/stores/user"; // store
   import { logout } from '../lib/services/authServices'; // logout function

  // Navigation items
  const navItems = [
    { name: "Features", href: "#features" },
    { name: "Pricing", href: "#pricing" },
    { name: "About", href: "#about" },
    { name: "Contact", href: "#contact" },
  ];
</script>

<svelte:head>
  <link
    href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap"
    rel="stylesheet"
  />
  <link
    rel="stylesheet"
    href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"
  />
</svelte:head>

<div class="min-h-screen flex flex-col font-['Inter']">
  <!-- Navigation -->
  <header class="bg-white py-4 px-6 shadow-sm sticky top-0 z-50">
    <div class="max-w-7xl mx-auto flex justify-between items-center">
      <div class="flex items-center space-x-2">
        <div
          class="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center"
        >
          <i class="fas fa-chart-line text-white text-sm"></i>
        </div>
        <span class="text-xl font-bold text-gray-800">MoneyWise</span>
      </div>

      <!-- Desktop Navigation -->
      <nav class="hidden md:flex space-x-8">
        {#each navItems as item}
          <a
            href={item.href}
            class="text-gray-600 hover:text-blue-600 transition font-medium"
            >{item.name}</a
          >
        {/each}
      </nav>

      <div class="flex items-center space-x-4">
        {#if $user}
          <div class="flex items-center space-x-4">
            {#if $user}
              <span class="text-gray-700 font-medium">
                {$user.displayName || $user.email}
              </span>
            {/if}
            <a
              href="/dashboard"
              class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition font-medium"
            >
              Dashboard
            </a>
            <a
              href="#"
              on:click|preventDefault={logout}
              class="text-gray-600 hover:text-blue-600 transition font-medium"
            >
              Logout
            </a>
          </div>
        {:else}
          <a
            href="/login"
            class="text-gray-600 hover:text-blue-600 transition font-medium"
            >Log in</a
          >
          <a
            href="/signup"
            class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition font-medium"
            >Sign up</a
          >
        {/if}

        <!-- Mobile menu button -->
        <button class="md:hidden text-gray-600 hover:text-blue-600 transition">
          <i class="fas fa-bars text-xl"></i>
        </button>
      </div>
    </div>

    <!-- Mobile Navigation (hidden by default) -->
    <div class="md:hidden mt-4 hidden">
      <div class="flex flex-col space-y-3">
        {#each navItems as item}
          <a
            href={item.href}
            class="text-gray-600 hover:text-blue-600 transition font-medium py-2"
            >{item.name}</a
          >
        {/each}
        {#if !$user}
          <div class="pt-2 border-t border-gray-200">
            <a
              href="/login"
              class="block text-gray-600 hover:text-blue-600 transition font-medium py-2"
              >Log in</a
            >
            <a href="/signup" class="block text-blue-600 font-medium py-2"
              >Sign up</a
            >
          </div>
        {/if}
      </div>
    </div>
  </header>

  <main class="flex-1 w-full">
    <slot />
  </main>

  <!-- Footer -->
  <footer class="bg-gray-800 text-white py-12 px-6">
    <div class="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
      <div>
        <div class="flex items-center space-x-2 mb-4">
          <div
            class="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center"
          >
            <i class="fas fa-chart-line text-white text-sm"></i>
          </div>
          <span class="text-xl font-bold">MoneyWise</span>
        </div>
        <p class="text-gray-400">Smart financial management for everyone.</p>
        <div class="flex space-x-4 mt-6">
          <a href="#" class="text-gray-400 hover:text-white transition"
            ><i class="fab fa-twitter"></i></a
          >
          <a href="#" class="text-gray-400 hover:text-white transition"
            ><i class="fab fa-facebook"></i></a
          >
          <a href="#" class="text-gray-400 hover:text-white transition"
            ><i class="fab fa-linkedin"></i></a
          >
          <a href="#" class="text-gray-400 hover:text-white transition"
            ><i class="fab fa-instagram"></i></a
          >
        </div>
      </div>
      <div>
        <h3 class="font-semibold mb-4">Product</h3>
        <ul class="space-y-2 text-gray-400">
          <li><a href="#" class="hover:text-white transition">Features</a></li>
          <li><a href="#" class="hover:text-white transition">Pricing</a></li>
          <li><a href="#" class="hover:text-white transition">Security</a></li>
          <li><a href="#" class="hover:text-white transition">FAQ</a></li>
        </ul>
      </div>
      <div>
        <h3 class="font-semibold mb-4">Company</h3>
        <ul class="space-y-2 text-gray-400">
          <li><a href="#" class="hover:text-white transition">About Us</a></li>
          <li><a href="#" class="hover:text-white transition">Careers</a></li>
          <li><a href="#" class="hover:text-white transition">Contact</a></li>
          <li><a href="#" class="hover:text-white transition">Blog</a></li>
        </ul>
      </div>
      <div>
        <h3 class="font-semibold mb-4">Legal</h3>
        <ul class="space-y-2 text-gray-400">
          <li>
            <a href="#" class="hover:text-white transition">Privacy Policy</a>
          </li>
          <li>
            <a href="#" class="hover:text-white transition">Terms of Service</a>
          </li>
          <li>
            <a href="#" class="hover:text-white transition">Cookie Policy</a>
          </li>
        </ul>
      </div>
    </div>
    <div
      class="max-w-7xl mx-auto mt-12 pt-8 border-t border-gray-700 text-center text-gray-400 text-sm"
    >
      <p>&copy; 2025 MoneyWise. All rights reserved.</p>
    </div>
  </footer>
</div>

<style>
  /* Custom styles for the layout */
  :global(body) {
    font-family: "Inter", sans-serif;
  }
</style>
