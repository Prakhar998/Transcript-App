"use client";

import React, { useState } from 'react';
import { Button, Typography, Container, Box } from '@mui/material';
import Tesseract from 'tesseract.js';

const ImageToText: React.FC = () => {
  const [text, setText] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    setText('');
    setError(null);

    Tesseract.recognize(file, 'eng', {
      logger: (m) => console.log(m),
    })
      .then(({ data: { text } }) => {
        setText(text);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError('Failed to extract text from image');
        setIsLoading(false);
      });
  };

  return (
    <Container maxWidth="md">
      <Box sx={{ py: 4 }}>
        <Typography variant="h5" gutterBottom>
          Image to Text (OCR)
        </Typography>

        <Button variant="contained" component="label" sx={{ mb: 3 }}>
          Upload Image
          <input type="file" accept="image/*" hidden onChange={handleImageUpload} />
        </Button>

        {isLoading && <Typography variant="body1">Processing...</Typography>}

        {error && (
          <Typography color="error" sx={{ mb: 2 }}>
            {error}
          </Typography>
        )}

        <Box
          sx={{
            p: 2,
            bgcolor: 'grey.50',
            borderRadius: 1,
            minHeight: 100,
            maxHeight: 400,
            overflow: 'auto',
          }}
        >
          <Typography variant="body1">{text || 'Your extracted text will appear here...'}</Typography>
        </Box>
      </Box>
    </Container>
  );
};

export default ImageToText;
