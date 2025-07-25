import React, { useState } from 'react';
import {
  Box, Button, Typography, Paper, CircularProgress,
} from '@mui/material';
import diseaseData from '../data/diseases.json';

const UploadPage = () => {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e) => {
    const img = e.target.files[0];
    setFile(img);
    setPreview(URL.createObjectURL(img));
    setResult(null);
  };

  const handleSubmit = async () => {
    if (!file) return;
    setLoading(true);
    const formData = new FormData();
    formData.append('image', file);
  
    try {
      const res = await fetch('http://localhost:5050/predict', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
  
      if (data.predicted_class !== undefined) {
        const diseaseInfo = diseaseData[data.predicted_class]; // map index to metadata
        setResult({
          ...data,
          disease: diseaseInfo,
        });
      } else {
        setResult({ error: 'Prediction failed' });
      }
    } catch (err) {
      setResult({ error: 'Something went wrong.' });
    } finally {
      setLoading(false);
    }
  };
  

  return (
    <Box sx={{ maxWidth: 600, mx: 'auto', mt: 6 }}>
      <Typography variant="h4" gutterBottom>🌿 CropAI Disease Detector</Typography>

      <Paper sx={{ p: 3, mb: 3 }} elevation={3}>
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
        />
        {preview && (
          <Box sx={{ mt: 2 }}>
            <img src={preview} alt="preview" width="100%" style={{ borderRadius: 8 }} />
          </Box>
        )}
        <Button
          variant="contained"
          color="primary"
          sx={{ mt: 2 }}
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? <CircularProgress size={24} /> : 'Submit Image'}
        </Button>
      </Paper>
      
      {result && (
        <Paper sx={{ p: 2, backgroundColor: '#f4f4f4' }} elevation={1}>
            {result.error ? (
            <Typography color="error">{result.error}</Typography>
            ) : (
            <>
                <Typography><strong>Predicted Class:</strong> {result.predicted_class}</Typography>
                <Typography><strong>Confidence:</strong> {(result.confidence * 100).toFixed(2)}%</Typography>
                {result.disease && (
                <Box sx={{ mt: 2 }}>
                    <Typography variant="h6">🦠 Disease: {result.disease.name}</Typography>
                    <Typography><strong>Symptoms:</strong> {result.disease.symptoms}</Typography>
                    <Typography><strong>Management:</strong> {result.disease.management}</Typography>
                </Box>
                )}
            </>
            )}
        </Paper>
        )}

    </Box>
  );
};

export default UploadPage;
