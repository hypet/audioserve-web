<script lang="ts">
  import Shuffle from "svelte-material-icons/Shuffle.svelte";
  import { createEventDispatcher } from "svelte";
  import { clickOutside } from "../util/dom";
  import { formatWSMessage } from "../types/types";
  import { ShuffleMode, WSMessageOutType } from "../types/enums";
  import { sendWsMessage, activeShuffleMode } from "../state/stores";
  import type { WSMessage } from "../types/types";
  const dispatch = createEventDispatcher();

  let shuffleListVisible = false;
  let shuffleListButton: HTMLAnchorElement;
  const shuffleModes = Object.keys(ShuffleMode)
      .filter((value => isNaN(Number(value)) === false))
      .map(key => ShuffleMode[key]);

  function updateShuffleMode() {
    let switchShuffle: WSMessage = formatWSMessage(WSMessageOutType.SwitchShuffle, { mode: $activeShuffleMode });
    sendWsMessage(switchShuffle);
    console.log("Sending shuffle mode: ", switchShuffle);

    shuffleListVisible = false;
  }
</script>
<div class="dropdown">
  <!-- svelte-ignore a11y-invalid-attribute -->
  <a
    href="#"
    on:click|preventDefault={() => (shuffleListVisible = !shuffleListVisible)}
    aria-label="Shuffle mode"
    aria-expanded={shuffleListVisible}
    bind:this={shuffleListButton}
    id="shuffle-button"><Shuffle size="1.9rem" /></a
  >
  {#if shuffleListVisible}
    <div
      use:clickOutside={shuffleListButton}
      on:outclick={() => (shuffleListVisible = false)}
    >
      <aside class="dropdown-content-shuffle" style={shuffleListVisible ? "" : "display:none"}>
        <nav>
            <ul>
                {#each shuffleModes as mode}
                <li class="option">
                  <input
                    type="radio"
                    name="shuffleMode"
                    value={mode}
                    id={"shuffle-" + mode}
                    bind:group={$activeShuffleMode}
                    on:change={updateShuffleMode}
                /><label for={"shuffle-" + mode}>{mode}</label>
                </li>
              {/each}
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
  
    .dropdown-content-shuffle {
      position: absolute;
      right: 0;
      background-color: var(--menu-background);
      min-width: 200px;
      box-shadow: 0px 8px 16px 0px var(--menu-shadow);
      z-index: 999;
      padding-left: 1rem;
    }
  
    .dropdown a {
      background-color: transparent !important;
    }
  </style>
  