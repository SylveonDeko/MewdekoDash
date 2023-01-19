<script lang="ts">
  export let profileData : {alt: string, image: string, name: string, description: string}
</script>

<div class="flex flex-col items-center text-mewd-white p-7">
  <img alt={profileData.alt}
                              class="rounded-full mb-3"
                              height="150"
                              src={profileData.image}
                              width="150">
  <p class="font-bold text-2xl">{profileData.name}</p>
  <p class="mb-2">{profileData.description}</p>
</div>