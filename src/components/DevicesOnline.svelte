<script lang="ts">
  import CellphoneLink from "svelte-material-icons/CellphoneLink.svelte";
  import { createEventDispatcher } from "svelte";
  import { clickOutside } from "../util/dom";
  import { formatWSMessage, WSMessage } from "../types/types";
  import { WSMessageOutType } from "../types/enums";
  import { webSocket, deviceId, activeDeviceId, devicesOnline } from "../state/stores";
  const dispatch = createEventDispatcher();

  let deviceListVisible = false;
  let deviceListButton: HTMLAnchorElement;

  function updateDeviceList() {
    let makeDeviceActive: WSMessage = formatWSMessage(WSMessageOutType.MakeDeviceActive, { device_id: $activeDeviceId });
    webSocket.send(JSON.stringify(makeDeviceActive));
    console.log("Sending make device active: ", makeDeviceActive);

    deviceListVisible = false;
  }
</script>
<div class="dropdown">
  <!-- svelte-ignore a11y-invalid-attribute -->
  <a
    href="#"
    on:click|preventDefault={() => (deviceListVisible = !deviceListVisible)}
    aria-label="Device list"
    aria-expanded={deviceListVisible}
    bind:this={deviceListButton}
    id="device-list-button"><CellphoneLink size="1.9rem" /></a
  >
  {#if deviceListVisible}
    <div
      use:clickOutside={deviceListButton}
      on:outclick={() => (deviceListVisible = false)}
    >
      <aside class="dropdown-content" style={deviceListVisible ? "" : "display:none"}>
        <nav>
            <ul>
                {#each $devicesOnline as device}
                <li class="option">
                  <input
                    type="radio"
                    name="activeDevice"
                    value={device.id}
                    id={"radio-" + device.id}
                    bind:group={$activeDeviceId}
                    on:change={updateDeviceList}
                /><label for={"radio-" + device.id}>{device.name}
                        {#if $deviceId === device.id} (this)
                        {/if}
                    </label>
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
  
    .dropdown-content {
      position: absolute;
      right: 0;
      background-color: var(--menu-background);
      min-width: 350px;
      box-shadow: 0px 8px 16px 0px var(--menu-shadow);
      z-index: 999;
      padding-left: 1rem;
    }
  
    .dropdown a {
      background-color: transparent !important;
    }
  </style>
  