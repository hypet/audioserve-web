<script lang="ts">
  import { createEventDispatcher, getContext } from "svelte";
  import { group } from "../state/stores";
  import Menu from "svelte-material-icons/Menu.svelte";
  import { capitalize } from "../util";
  import { otherTheme } from "../util/browser";
  import { clickOutside } from "../util/dom";
  const dispatch = createEventDispatcher();
  const cache = getContext("cache");

  let menuVisible = false;
  let menuButton: HTMLAnchorElement;

  function menuClick(evt) {
    menuVisible = false;
    const item = evt.target.dataset.menu;
    dispatch("menu", item);
  }
</script>

<div class="dropdown">
  <!-- svelte-ignore a11y-invalid-attribute -->
  <a
    href="#"
    on:click|preventDefault={() => (menuVisible = !menuVisible)}
    aria-label="Menu"
    aria-expanded={menuVisible}
    bind:this={menuButton}
    id="main-menu-button"><Menu size="1.9rem" /></a
  >
  {#if menuVisible}
    <div
      use:clickOutside={menuButton}
      on:outclick={() => (menuVisible = false)}
    >
      <aside class="dropdown-content" style={menuVisible ? "" : "display:none"}>
        <nav>
          <!-- svelte-ignore a11y-invalid-attribute -->
          <ul>
            {#if $group}
              <li>
                <a
                  href="#"
                  data-menu="recent"
                  on:click|preventDefault={menuClick}>Recently Listened</a
                >
              </li>
            {/if}
            <li>
              <a href="#" data-menu="logout" on:click|preventDefault={menuClick}
                >Logout</a
              >
            </li>
            <li>
              <a
                href="#"
                data-menu="switch-theme"
                on:click|preventDefault={menuClick}
                >{capitalize(otherTheme())} Theme</a
              >
            </li>
            <li>
              <a
                href="#"
                data-menu="show-preferences"
                on:click|preventDefault={menuClick}>Preferences</a
              >
            </li>
            {#if cache}
              <li>
                <a
                  href="#"
                  data-menu="download"
                  on:click|preventDefault={menuClick}
                  >Cache Current Folder
                </a>
              </li>
              <li>
                <a
                  href="#"
                  data-menu="clear-cache"
                  on:click|preventDefault={menuClick}>Clear Cache</a
                >
              </li>
            {/if}
            <li>
              <a href="#" data-menu="about" on:click|preventDefault={menuClick}
                >About</a
              >
            </li>
          </ul>
        </nav>
      </aside>
    </div>
  {/if}
</div>

<style>
  summary {
    color: var(--primary);
  }

  summary:focus {
    color: var(--primary);
  }

  summary:hover {
    color: var(--primary-hover);
  }
  .option {
    padding-left: 1rem;
    font-size: 75%;
  }
  .dropdown {
    position: relative;
    display: inline-block;
  }

  .dropdown-content {
    position: absolute;
    right: 0;
    background-color: var(--menu-background);
    min-width: 260px;
    box-shadow: 0px 8px 16px 0px var(--menu-shadow);
    z-index: 999;
    padding-left: 1rem;
  }

  .dropdown a {
    background-color: transparent !important;
  }
</style>
