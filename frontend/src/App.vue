<script setup lang="ts">
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ChevronLeft, ChevronRight, Pause, Play } from "lucide-vue-next";
import { Separator } from "@/components/ui/separator";
import { Progress } from "./components/ui/progress";
import UploadAudio from "./components/UploadAudio.vue";
import { onMounted, ref, watch } from "vue";
import { API_URL } from "./constants";
import axios from "axios";

const tracks = ref<any[]>([]);
const currentTrack = ref<any>(null);
const isPlaying = ref(false);
const progress = ref(0);
const audioElement = ref<HTMLAudioElement | null>(null);

const fetchTracks = async () => {
  try {
    const response = await axios.get(`${API_URL}/api/audio/tracks`);
    tracks.value = response.data;
    if (tracks.value.length > 0) {
      currentTrack.value = tracks.value[0];
    }
  } catch (error) {
    console.log(error);
  }
};

const selectTrack = (track: any) => {
  if (audioElement.value) {
    audioElement.value.pause();
    audioElement.value.currentTime = 0;
  }
  currentTrack.value = track;
  isPlaying.value = false;
  progress.value = 0;
};

const togglePlayPause = () => {
  if (!audioElement.value) return;
  if (isPlaying.value) {
    audioElement.value.pause();
  } else {
    audioElement.value.play();
  }
  isPlaying.value = !isPlaying.value;
};

const updateProgress = () => {
  if (audioElement.value) {
    progress.value =
      (audioElement.value.currentTime / audioElement.value.duration) * 100;
  }
};

watch(currentTrack, (newTrack) => {
  if (audioElement.value && newTrack) {
    audioElement.value.src = newTrack.audioUrl;
    audioElement.value.load();
    if (isPlaying.value) {
      audioElement.value.play();
    }
  }
});

onMounted(() => {
  fetchTracks();
  audioElement.value = new Audio();
  audioElement.value.ontimeupdate = updateProgress;
  audioElement.value.onended = () => {
    isPlaying.value = false;
    progress.value = 0;
  };
});
</script>
<template>
  <main>
    <Card class="lg:w-[60rem] my-[6rem] mx-auto border-none shadow-none">
      <CardHeader
        class="sm:flex sm:flex-row grid grid-cols-1 gap-y-4 items-center justify-between"
      >
        <div>
          <CardTitle>My Music Archives</CardTitle>
          <CardDescription>
            All of my favourite musics are archived here.
          </CardDescription>
        </div>
        <div>
          <UploadAudio />
        </div>
      </CardHeader>
      <CardContent>
        <Separator />
      </CardContent>
      <CardContent class="md:flex md:flex-row grid grid-cols-1 gap-x-10">
        <div>
          <AspectRatio :ratio="16 / 9" class="bg-muted" v-if="currentTrack">
            <img
              :src="
                currentTrack.thumbnail ||
                'https://images.unsplash.com/photo-1588345921523-c2dcdb7f1dcd?w=800&dpr=2&q=80'
              "
              :alt="currentTrack.title"
              class="rounded-md object-cover w-[50rem] h-[20rem]"
            />
          </AspectRatio>
          <div class="mt-2" v-if="currentTrack">
            <CardDescription>
              {{ currentTrack.title }} - {{ currentTrack.artist }}
            </CardDescription>
          </div>
          <div class="mt-4">
            <Progress :model-value="progress" class="h-[3px]" />
          </div>
          <div class="flex flex-row items-center gap-x-6 justify-center my-4">
            <ChevronLeft
              class="w-6 h-6 cursor-pointer"
              @click="
                selectTrack(
                  tracks[
                    (tracks.indexOf(currentTrack) - 1 + tracks.length) %
                      tracks.length
                  ]
                )
              "
            />
            <div @click="togglePlayPause" class="cursor-pointer">
              <Play v-if="!isPlaying" class="w-6 h-6" />
              <Pause v-else class="w-6 h-6" />
            </div>
            <ChevronRight
              class="w-6 h-6 cursor-pointer"
              @click="
                selectTrack(
                  tracks[(tracks.indexOf(currentTrack) + 1) % tracks.length]
                )
              "
            />
          </div>
        </div>
        <div class="w-full py-2">
          <router-link
            href="/"
            class="flex flex-row justify-between items-center cursor-pointer mb-2 font-medium"
            v-for="(track, index) in tracks"
            :key="track._id"
            @click.prevent="selectTrack(track)"
            :class="{
              'text-blue-500 font-bold': track === currentTrack,
              'hover:text-gray-700': track !== currentTrack,
            }"
          >
            <CardDescription>
              {{ index + 1 }}. {{ track.title }} - {{ track.artist }}
            </CardDescription>
          </router-link>
        </div>
      </CardContent>
    </Card>
    <audio ref="audioElement"></audio>
  </main>
  <Toaster />
</template>
