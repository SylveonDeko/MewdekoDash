<script>
  import { page } from "$app/stores";
  import Interactable from "$lib/util/InteractableElement.svelte";
</script>
<div class="h-[calc(100vh-5.6rem)] w-full bg-mewd-light-grey flex flex-col justify-center">
  <div class="flex justify-center h-min">
    <Interactable cta={{text: "Go Home!", href: "/", target: "_parent"}}>
      <img width="750px" height="600px" alt="{$page.status} Error Cat." title="Error Cat."
         src="https://http.cat/{$page.status}">
    </Interactable>
  </div>
</div>
