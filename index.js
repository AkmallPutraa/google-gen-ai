import express from 'express';
import dotenv from 'dotenv';
import multer from "multer";

import fs from 'fs';
import path from 'path';

import { createPartFromUri, createUserContent, GoogleGenAI } from '@google/genai';
import { error } from 'console';
// import { error } from 'console';

// setup aplikasinya disini
dotenv.config(); // load file .env

// contoh menampilkan API_KEY didalam terminal
// console.log(process.env.GOOGLE_GEMINI_API_KEY, "Ini adalah API Key nya si Google Gemini");

//inisialisasi Express.js
const app = express();

// tambah 1 middleware --> .use()
app.use(
  //tambahkan Express JSON Middleware
  //Content-Type: application/json
  express.json()
);

 // inisialisasi model
 // gemini-2.0-flash
 const genAI = new GoogleGenAI({
  apiKey: process.env.GOOGLE_GEMINI_API_KEY
 });

// memanggil model
// const result = await genAI.models.generateContent({ model: 'gemini-2.0-flash', contents: "HI!"})
// console.log(result.text);

 const upload = multer({
  dest: 'uploads/'
 });

 //route endpoints

app.post('/generate-text', async (req, res) =>{
  const { prompt } = req.body;

  try {
    const result = await genAI.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: prompt
    });


    
    res.json({
      output: result.text
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({
      error: e.message
    });
  }
});

// upload.single(formDataYangDicari: string)
app.post('/generate-from-image', upload.single('image'), async (req, res) => {
  const { prompt = "Describe this uploaded image." } = req.body;

  try {
    // 1. Baca file gambar
    const image = await genAI.files.upload({
      file: req.file.path,
      config: {
        mimeType: req.file.mimetype
      }
    });

    // 3. Sertakan dalam promptAdd commentMore actions
    const result = await genAI.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: [
        createUserContent([
          prompt,
          createPartFromUri(image.uri, image.mimeType)
        ]),
      ],
    });

    console.log(result.text);
    

    res.json({ output: result.text });
  } catch (error) {
    console.error("Error generating content:", error);
    res.status(500).json({ error: error.message });}
    finally {
      fs.unlinkSync(req.file.path);
    }
  });

  app.post('/generate-from-document', upload.single('document'), async (req, res) =>{
    const { prompt = "Describe this uploaded document." } = req.body;

    try {
      const filePath = req.file.path;
      const buffer = fs.readFileSync(filePath);
      const base64Data = buffer.toString('base64');
      const mimeType = req.file.mimetype;

      const documentPart = {
        inlineData: { data: base64Data, mimeType }
      }

      const result = await genAI.models.generateContent({
        model: 'gemini-2.0-flash',
        contents: [
          createUserContent([
            prompt,
            documentPart
          ]),
        ],
      });

    console.log(result.text);

      res.json({ output: result.text });
    } catch (error) {
      console.error("Error generating content:", error);
    res.status(500).json({ error: error.message });
    } finally {
      fs.unlinkSync(req.file.path);
    }
  });

  app.post('/generate-from-audio', upload.single('audio'), async (req, res) =>{
    const { prompt = "Describe this uploaded audio." } = req.body;

    try {
      const audioBuffer = fs.readFileSync(req.file.path);
      const base64Audio = audioBuffer.toString('base64');
      const mimeType = req.file.mimetype;

      const audioPart = {
        inlineData: {data: base64Audio, mimeType}
      };

      const result = await genAI.models.generateContent({
        model: 'gemini-2.0-flash',
        contents: [
          createUserContent([
            prompt,
            audioPart
          ]),
        ],
      });

      console.log(result.text);

      res.json({ output: result.text });


    } catch (error) {
      console.error("Error generating content:", error);
    res.status(500).json({ error: error.message });
    } finally {
      fs.unlinkSync(req.file.path);
    }

  })

 //

const PORT =3000;

app.listen(PORT, () => {
  console.log("I LOVE YOU " + PORT);
});
