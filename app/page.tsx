/**
 * Copyright 2024 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

"use client";

import { useState } from "react";
import { sendMessage, MessageData } from "./vertex";
import ReactMarkdown from "react-markdown";

interface FormData {
  file: File | null;
  prompt: string;
}

export default function Home() {
  const [response, setResponse] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [formData, setFormData] = useState<FormData>({
    file: null,
    prompt: "",
  });

  /**
   * Process the form by sending its contents to Gemini
   * @param e The form event
   */
  async function handleProcessing(e: React.FormEvent): Promise<void> {
    e.preventDefault();
    setLoading(true);
    try {
      setError(null);
      if (!formData.file) {
        setError("No file specified");
        return;
      }
      // Convert input file to base64
      const fileData = Buffer.from(await formData.file.arrayBuffer()).toString(
        "base64",
      );
      // Payload to send to server
      const f = {
        file: {
          contents: fileData,
          type: formData.file.type,
        },
        prompt: formData.prompt,
      } as MessageData;
      // sendMessage runs on the server - next.js will wrap this for us
      const r = await sendMessage(f);
      setResponse(r);
    } catch (error) {
      setError(`${error}`);
    } finally {
      setLoading(false);
    }
  }

  /**
   * Update form data when text input changes
   * @param field field that has changed
   * @param value value that has changed
   */
  function handleInputChange(field: string, value: string | FileList) {
    setFormData({ ...formData, [field]: value });
  }

  /**
   * Update form data when a file is selected - only selects one file
   * @param files file(s) selected in picker
   */
  function handleFileChange(files: FileList | null) {
    if (files) {
      setFormData({ ...formData, file: files[0] });
    }
  }

  return (
    <>
      <div className="flex items-center justify-center mt-10">
        {error && (
          <div
            className="p-4 mb-4 text-lg text-red-800 rounded-lg bg-red-50 dark:bg-gray-800 dark:text-red-400"
            role="alert"
          >
            <span className="font-bold">Error: </span> {error}
          </div>
        )}
      </div>
      <div className="flex items-center justify-center mt-10">
        <div className="flex-none bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
          {loading && (
            <div
              className="p-4 mb-4 text-lg text-blue-800 rounded-lg bg-red-50 dark:bg-gray-800 dark:text-red-400"
              role="alert"
            >
              Processing File...
            </div>
          )}
          <form className="">
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Question:
                <input
                  disabled={loading}
                  type="text"
                  name="prompt"
                  placeholder="e.g. Is this good for me?"
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  required
                  onChange={(e) => handleInputChange("prompt", e.target.value)}
                />
              </label>
            </div>
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Upload File:
                <input
                  type="file"
                  disabled={loading}
                  accept=".pdf,.jpg,.jpeg,.png,.mp4,.wav,.m4v"
                  name="file"
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  required
                  onChange={(e) => handleFileChange(e.target.files)}
                />
              </label>
              <p className="text-gray-500 bold text-xs">
                For example:{" "}
                <a
                  href="https://storage.googleapis.com/q4-24-techie-meetup/images/ingredients.jpg"
                  className="font-medium text-blue-600 dark:text-blue-500 hover:underline"
                  target="_blank"
                >
                  A drink&apos;s ingredients list
                </a>
              </p>
            </div>
            <div className="flex items-center justify-between mt-3">
              <button
                disabled={loading}
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                type="submit"
                onClick={handleProcessing}
              >
                Process
              </button>
            </div>
          </form>
        </div>
      </div>
      <div className="flex items-center justify-center mt-10">
        <div className="flex-auto w-96 m-10 font-sans">
          {response && (
            <div>
              <ReactMarkdown>{response}</ReactMarkdown>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
