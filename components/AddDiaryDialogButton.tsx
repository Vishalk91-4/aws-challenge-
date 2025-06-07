"use client";

import { useEffect, useRef, useState } from "react";
import "@aws-amplify/ui-react/styles.css";
import useMediaStream from "use-media-stream";
import { Visualizer } from "react-sound-visualizer";
import Image from "next/image";
import { FaMicrophone, FaRegPenToSquare } from "react-icons/fa6";
import { TiDeleteOutline } from "react-icons/ti";
import { IoSparkles } from "react-icons/io5";
import { TbReload } from "react-icons/tb";
import { StorageManager } from "@aws-amplify/ui-react-storage";
import { Divider, Loader } from "@aws-amplify/ui-react";
import { generateClient } from "aws-amplify/data";
import { type Schema } from "../amplify/data/resource";
import toast from "react-hot-toast";
import { Predictions } from "@aws-amplify/predictions";
import { MdModeEditOutline } from "react-icons/md";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "./ui/textarea";
import { Label } from "./ui/label";
import { Button } from "./ui/button";
import { analyseMood } from "@/lib/utils";

const client = generateClient<Schema>();

const AddDiaryDialogButton = ({
  isEditing,
  editDiaryId,
  editContent,
  editImages,
  editMood,
  editDate,
}: {
  isEditing: boolean;
  editDiaryId?: string;
  editContent?: string;
  editImages?: string[];
  editMood?: string;
  editDate?: string;
}) => {
  const [transcription, setTranscription] = useState("");

  const recognitionRef = useRef<SpeechRecognition>();
  const {
    stream,
    start: startStream,
    stop: stopStream,
    isStreaming,
    isSupported,
  } = useMediaStream({
    mediaDeviceConstraints: { audio: true, video: false },
  });

  const [isActive, setIsActive] = useState(false);
  const [content, setContent] = useState(editContent || "");
  const [isSpeechSupported, setIsSpeechSupported] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [isOptimising, setIsOptimising] = useState(false);
  const [sentiment, setSentiment] = useState("");
  const [mood, setMood] = useState("");
  const [images, setImages] = useState([] as string[]);

  useEffect(() => {
    setImages(editImages || []);
    setContent(editContent || "");
  }, []);

  useState(() => {
    if (!window.SpeechRecognition && !window.webkitSpeechRecognition) {
      setIsSpeechSupported(false);
    }
  });

  function handleRecord() {
    console.log("Recording");
    if (isActive) {
      handleStop();
      setIsActive(false);
      return;
    }

    startStream();

    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    recognitionRef.current = new SpeechRecognition();
    recognitionRef.current.continuous = true;
    recognitionRef.current.start();

    recognitionRef.current.onerror = (event) => {
      console.log(event);
      setIsSpeechSupported(false);
      handleStop();
    };

    recognitionRef.current.onstart = () => {
      setIsActive(true);
    };

    recognitionRef.current.onend = () => {
      handleStop();
    };

    recognitionRef.current.onresult = async function (event) {
      console.log(event);
      const newTranscript =
        event.results[event.results.length - 1][0].transcript;
      setTranscription((prev) => prev + newTranscript);
      setContent((prev) => prev + newTranscript);
    };
  }

  function handleStop() {
    recognitionRef.current?.stop();
    recognitionRef.current = undefined;
    stopStream();
    setIsActive(false);
  }

  async function handleSentimentAnalysis() {
    try {
      const response = await Predictions.interpret({
        text: {
          source: {
            text: content,
            language: "en",
          },
          type: "sentiment",
        },
      });
      if (response.textInterpretation.sentiment) {
        console.log(response.textInterpretation.sentiment);
        setSentiment(response.textInterpretation.sentiment.predominant);
        const interpretedMood = analyseMood(
          response.textInterpretation.sentiment
        );
        return interpretedMood;
      }
    } catch (error) {
      console.error("Error while analysing sentiment:", error);
      return;
    }
  }

  // Make a promise that does sentiment analysis and then saves the diary entry below

  async function handleSave() {
    try {
      toast
        .promise(
          new Promise(async (resolve, reject) => {
            const mood = await handleSentimentAnalysis();
            if (isEditing) {
              const data = {
                id: editDiaryId,
                content: content,
                images: editImages,
                mood: mood,
              };
              await client.models.Diary.update(data as any)
                .then(() => {
                  setImages([]);
                  resolve("Diary entry saved successfully");
                })
                .catch((error) => {
                  setImages([]);
                  reject("Error saving diary entry");
                });
            } else {
              await client.models.Diary.create({
                content: content,
                images: images,
                mood: mood,
              })
                .then(() => {
                  setImages([]);
                  resolve("Diary entry saved successfully");
                })
                .catch((error) => {
                  setImages([]);
                  reject("Error saving diary entry");
                });
            }
          }),
          {
            loading: "Saving diary entry...",
            success: "Diary entry saved successfully",
            error: "Error saving diary entry",
          }
        )
        .then(() => {
          setContent("");
          setIsOpen(false);
        })
        .finally(() => {
          setContent("");
        });
    } catch (error) {
      toast.error("Error saving diary entry");
      console.error("Error saving diary entry", error);
    }
  }

  async function handleOptimise() {
    if (!content) {
      toast.error("Please enter some text to optimise");
      return;
    }
    setIsOptimising(true);
    try {
      const { data, errors } = await client.queries.aiEnhanceText({
        text: content,
      });
      if (data) {
        console.log(data);
        setContent(data);
      }
      if (errors) {
        console.error("Error while optimizing text:", errors);
        toast.error("Failed to optimize text. Please try again later.");
      }
    } catch (error) {
      console.error("Error while optimizing text:", error);
      toast.error("Failed to optimize text. Please try again later.");
    } finally {
      setIsOptimising(false);
    }
