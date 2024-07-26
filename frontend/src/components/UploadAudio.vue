<script setup lang="ts">
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogTrigger,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { Plus, X } from "lucide-vue-next";
import { Badge } from "./ui/badge";
import { h, ref } from "vue";
import axios from "axios";
import { API_URL } from "@/constants";
import { ToastAction, useToast } from "./ui/toast";

const selectedImgUrl = ref<string | null>(null);
const selectedFileName = ref<string | null>(null);
const title = ref("");
const artist = ref("");
const audioFile = ref<File | null>(null);
const thumbnailFile = ref<File | null>(null);

const { toast } = useToast();

const handleFileChange = (event: Event) => {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];

  if (file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      selectedImgUrl.value = e.target?.result as string;
    };
    reader.readAsDataURL(file);

    if (target.name === "thumbnail") {
      thumbnailFile.value = file;
      selectedFileName.value = file.name;
    } else if (target.name === "audio") {
      audioFile.value = file;
    }
  }
};

const removeFile = () => {
  selectedImgUrl.value = null;
  selectedFileName.value = null;
  thumbnailFile.value = null;
  audioFile.value = null;

  const fileInputs = document.querySelectorAll(
    'input[type="file"]'
  ) as NodeListOf<HTMLInputElement>;
  fileInputs.forEach((input) => (input.value = ""));
};

const MAX_FILENAME_LENGTH = 20;
const shortenFilename = (filename: string | null, maxLength: number) => {
  if (!filename) return "No file selected";
  return filename.length > maxLength
    ? filename.substring(0, maxLength) + "..."
    : filename;
};

const uploadTrack = async () => {
  if (
    !title.value ||
    !artist.value ||
    !audioFile.value ||
    !thumbnailFile.value
  ) {
    alert("Please fill all fields and select files.");
    return;
  }

  const formData = new FormData();
  formData.append("title", title.value);
  formData.append("artist", artist.value);
  formData.append("audio", audioFile.value);
  formData.append("thumbnail", thumbnailFile.value);

  try {
    await axios.post(`${API_URL}/upload`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    toast({
      title: "Track successfully uploaded.",
    });
    removeFile();
    title.value = "";
    artist.value = "";
  } catch (error) {
    console.error("Unexpected error:", error);
    toast({
      title: "Uh oh! Something went wrong.",
      description: "There was a problem with your request.",
      variant: "destructive",
      action: h(
        ToastAction,
        {
          altText: "Try again",
        },
        {
          default: () => "Try again",
        }
      ),
    });
  }
};
</script>

<template>
  <Dialog>
    <DialogTrigger as-child>
      <Button size="sm"> <Plus class="w-4 h-4 mr-1" /> Upload </Button>
    </DialogTrigger>
    <DialogContent class="flex flex-row gap-x-8">
      <div>
        <img
          :src="
            selectedImgUrl ||
            'https://images.unsplash.com/photo-1588345921523-c2dcdb7f1dcd?w=800&dpr=2&q=80'
          "
          alt="Photo by Drew Beamer"
          class="rounded-md object-cover w-[20rem] h-[10rem]"
        />
        <div class="mt-2">
          <Badge class="flex flex-row justify-between items-center">
            {{ shortenFilename(selectedFileName, MAX_FILENAME_LENGTH) }}
            <span @click="removeFile" class="cursor-pointer">
              <X class="w-3 h-3" />
            </span>
          </Badge>
        </div>
        <div class="mt-2">
          <Label>Thumbnail</Label>
          <Input
            type="file"
            name="thumbnail"
            size="sm"
            @change="handleFileChange"
          />
        </div>
      </div>
      <div class="flex flex-col gap-y-3 w-[30rem]">
        <div>
          <Label>Title</Label>
          <Input type="text" v-model="title" />
        </div>
        <div>
          <Label>Artist</Label>
          <Input type="text" v-model="artist" />
        </div>
        <div>
          <Label>Audio (mp3)</Label>
          <Input type="file" name="audio" @change="handleFileChange" />
        </div>
        <DialogFooter>
          <Button class="sm" @click="uploadTrack"> Upload </Button>
        </DialogFooter>
      </div>
    </DialogContent>
  </Dialog>
</template>
