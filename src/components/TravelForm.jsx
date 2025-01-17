import React, { useState, useEffect } from 'react';
    import {
      TextField,
      Button,
      Select,
      MenuItem,
      FormControl,
      InputLabel,
      Box,
      Grid,
      Typography,
      FormHelperText,
      CircularProgress,
    } from '@mui/material';

    function TravelForm({ onSubmit }) {
      const [name, setName] = useState('');
      const [country, setCountry] = useState('');
      const [story, setStory] = useState('');
      const [countries, setCountries] = useState([]);
      const [images, setImages] = useState([]);
      const [youtubeLink, setYoutubeLink] = useState('');
      const [youtubeApiKey, setYoutubeApiKey] = useState('');
      const [geminiApiKey, setGeminiApiKey] = useState('');
      const [youtubeApiKeyValid, setYoutubeApiKeyValid] = useState(null);
      const [geminiApiKeyValid, setGeminiApiKeyValid] = useState(null);
      const [loadingAI, setLoadingAI] = useState(false);

      useEffect(() => {
        fetch('https://restcountries.com/v3.1/all')
          .then((response) => response.json())
          .then((data) => {
            const countryNames = data.map((country) => country.name.common);
            countryNames.sort();
            setCountries(countryNames);
          })
          .catch((error) => console.error('Error fetching countries:', error));
      }, []);

      const handleImageUpload = (event) => {
        const files = Array.from(event.target.files);
        setImages(files);
      };

      const handleSubmit = (event) => {
        event.preventDefault();
        const newPost = {
          name,
          country,
          story,
          images: images.map((image) => URL.createObjectURL(image)),
        };
        onSubmit(newPost);
        setName('');
        setCountry('');
        setStory('');
        setImages([]);
        setYoutubeLink('');
        setYoutubeApiKey('');
        setGeminiApiKey('');
        setYoutubeApiKeyValid(null);
        setGeminiApiKeyValid(null);
        setLoadingAI(false);
      };

      const handleValidateYoutubeApiKey = async () => {
        if (!youtubeApiKey) {
          setYoutubeApiKeyValid(false);
          return;
        }
        try {
          const isValid = await validateYoutubeApiKey(youtubeApiKey);
          setYoutubeApiKeyValid(isValid);
        } catch (error) {
          console.error('Error validating YouTube API key:', error);
          setYoutubeApiKeyValid(false);
        }
      };

      const handleValidateGeminiApiKey = async () => {
        if (!geminiApiKey) {
          setGeminiApiKeyValid(false);
          return;
        }
        try {
          const isValid = await validateGeminiApiKey(geminiApiKey);
          setGeminiApiKeyValid(isValid);
        } catch (error) {
          console.error('Error validating Gemini API key:', error);
          setGeminiApiKeyValid(false);
        }
      };

      const validateYoutubeApiKey = async (apiKey) => {
        const apiUrl = `https://www.googleapis.com/youtube/v3/videos?part=id&id=dQw4w9WgXcQ&key=${apiKey}`;
        try {
          const response = await fetch(apiUrl);
          const data = await response.json();
          return data.items !== undefined;
        } catch (error) {
          console.error('Error validating YouTube API key:', error);
          return false;
        }
      };

      const validateGeminiApiKey = async (apiKey) => {
        const geminiApiUrl =
          'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=' +
          apiKey;
        try {
          const response = await fetch(geminiApiUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              contents: [
                {
                  parts: [{ text: 'Test' }],
                },
              ],
            }),
          });
          return response.ok;
        } catch (error) {
          console.error('Error validating Gemini API key:', error);
          return false;
        }
      };

      const handleCreateBlogWithAI = async () => {
        if (!youtubeLink || !youtubeApiKey || !geminiApiKey) {
          alert('Please provide YouTube link, YouTube API key, and Gemini API key.');
          return;
        }

        if (youtubeApiKeyValid !== true || geminiApiKeyValid !== true) {
          alert('Please validate both API keys before creating a blog with AI.');
          return;
        }

        setLoadingAI(true);
        setStory('');
        try {
          const text = await fetchYoutubeText(youtubeLink, youtubeApiKey);
          if (text) {
            const aiGeneratedContent = await generateBlogContent(
              text,
              geminiApiKey,
            );
            setStory(aiGeneratedContent);
          } else {
            alert('Could not fetch captions or transcript for the given YouTube video.');
          }
        } catch (error) {
          console.error('Error creating blog with AI:', error);
          alert('Failed to create blog with AI. Please check the console for details.');
        } finally {
          setLoadingAI(false);
        }
      };

      const fetchYoutubeText = async (youtubeLink, youtubeApiKey) => {
        const videoId = youtubeLink.match(
          /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([^?&]+)/,
        )[1];

        if (!videoId) {
          alert('Invalid YouTube link.');
          return null;
        }

        try {
          // Attempt to fetch automatic captions
          let apiUrl = `https://www.googleapis.com/youtube/v3/captions?part=snippet&videoId=${videoId}&key=${youtubeApiKey}`;
          let response = await fetch(apiUrl);
          let data = await response.json();

          if (data.items && data.items.length > 0) {
            const autoCaption = data.items.find(
              (item) => item.snippet.language === 'en' && item.snippet.isAutoGenerated,
            );
            if (autoCaption) {
              const transcriptUrl = `https://www.googleapis.com/youtube/v3/captions/${autoCaption.id}?part=snippet&key=${youtubeApiKey}`;
              const transcriptResponse = await fetch(transcriptUrl);
              if (!transcriptResponse.ok) {
                console.error(
                  'Error fetching auto-generated captions:',
                  transcriptResponse.status,
                  transcriptResponse.statusText,
                );
              } else {
                const transcriptData = await transcriptResponse.json();
                const transcriptText = await fetch(
                  transcriptData.snippet.trackUrl,
                ).then((res) => res.text());
                return transcriptText;
              }
            }
          }

          // Attempt to fetch manual captions
          if (data.items && data.items.length > 0) {
            const manualCaption = data.items.find(
              (item) => item.snippet.language === 'en' && !item.snippet.isAutoGenerated,
            );
            if (manualCaption) {
              const transcriptUrl = `https://www.googleapis.com/youtube/v3/captions/${manualCaption.id}?part=snippet&key=${youtubeApiKey}`;
              const transcriptResponse = await fetch(transcriptUrl);
              if (!transcriptResponse.ok) {
                console.error(
                  'Error fetching manual captions:',
                  transcriptResponse.status,
                  transcriptResponse.statusText,
                );
              } else {
                const transcriptData = await transcriptResponse.json();
                const transcriptText = await fetch(
                  transcriptData.snippet.trackUrl,
                ).then((res) => res.text());
                return transcriptText;
              }
            }
          }

          // Attempt to fetch transcriptions
          apiUrl = `https://www.googleapis.com/youtube/v3/captions?part=snippet&videoId=${videoId}&key=${youtubeApiKey}`;
          response = await fetch(apiUrl);
          data = await response.json();

          if (data.items && data.items.length > 0) {
            const transcript = data.items[0];
            const transcriptUrl = `https://www.googleapis.com/youtube/v3/captions/${transcript.id}?part=snippet&key=${youtubeApiKey}`;
            const transcriptResponse = await fetch(transcriptUrl);
            if (!transcriptResponse.ok) {
              console.error(
                'Error fetching transcript:',
                transcriptResponse.status,
                transcriptResponse.statusText,
              );
            } else {
              const transcriptData = await transcriptResponse.json();
              const transcriptText = await fetch(
                transcriptData.snippet.trackUrl,
              ).then((res) => res.text());
              return transcriptText;
            }
          }

          // Fallback to video description
          const videoDetailsUrl = `https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${videoId}&key=${youtubeApiKey}`;
          const videoDetailsResponse = await fetch(videoDetailsUrl);
          const videoDetailsData = await videoDetailsResponse.json();
          if (
            videoDetailsData &&
            videoDetailsData.items &&
            videoDetailsData.items.length > 0 &&
            videoDetailsData.items[0].snippet &&
            videoDetailsData.items[0].snippet.description
          ) {
            return videoDetailsData.items[0].snippet.description;
          }

          alert('No captions, transcript, or description found for this video.');
          return null;
        } catch (error) {
          console.error('Error fetching YouTube data:', error);
          alert('Failed to fetch YouTube data. Please check the console for details.');
          return null;
        }
      };

      const generateBlogContent = async (transcription, geminiApiKey) => {
        const geminiApiUrl =
          'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=' +
          geminiApiKey;

        const prompt = `Generate a travel blog post based on the following text: ${transcription}. The blog post should be between 500 and 700 words, and should be engaging and informative.`;

        try {
          const response = await fetch(geminiApiUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              contents: [
                {
                  parts: [{ text: prompt }],
                },
              ],
            }),
          });

          const data = await response.json();
          if (
            data &&
            data.candidates &&
            data.candidates.length > 0 &&
            data.candidates[0].content &&
            data.candidates[0].content.parts &&
            data.candidates[0].content.parts.length > 0
          ) {
            return data.candidates[0].content.parts[0].text;
          } else {
            console.error('Gemini API response error:', data);
            return 'Failed to generate blog content with AI.';
          }
        } catch (error) {
          console.error('Error generating blog content with Gemini AI:', error);
          return 'Failed to generate blog content with AI.';
        }
      };

      return (
        <Box sx={{ padding: 3 }}>
          <Typography variant="h5" gutterBottom>
            Share Your Travel Story
          </Typography>
          <form onSubmit={handleSubmit}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Your Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel id="country-label">Country Visited</InputLabel>
                  <Select
                    labelId="country-label"
                    id="country"
                    value={country}
                    label="Country Visited"
                    onChange={(e) => setCountry(e.target.value)}
                    required
                  >
                    <MenuItem value="">Select a country</MenuItem>
                    {countries.map((countryName) => (
                      <MenuItem key={countryName} value={countryName}>
                        {countryName}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Your Travel Story (500-700 words)"
                  multiline
                  rows={10}
                  value={story}
                  onChange={(e) => setStory(e.target.value)}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="YouTube Video Link"
                  value={youtubeLink}
                  onChange={(e) => setYoutubeLink(e.target.value)}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="YouTube API Key"
                  value={youtubeApiKey}
                  onChange={(e) => setYoutubeApiKey(e.target.value)}
                  error={youtubeApiKeyValid === false}
                  helperText={
                    youtubeApiKeyValid === false
                      ? 'Invalid YouTube API Key'
                      : ''
                  }
                />
                <Button
                  variant="outlined"
                  onClick={handleValidateYoutubeApiKey}
                  sx={{ marginTop: 1 }}
                >
                  Validate YouTube API Key
                </Button>
                {youtubeApiKeyValid === true && (
                  <FormHelperText sx={{ color: 'green' }}>
                    YouTube API Key is valid
                  </FormHelperText>
                )}
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Gemini API Key"
                  value={geminiApiKey}
                  onChange={(e) => setGeminiApiKey(e.target.value)}
                  error={geminiApiKeyValid === false}
                  helperText={
                    geminiApiKeyValid === false ? 'Invalid Gemini API Key' : ''
                  }
                />
                <Button
                  variant="outlined"
                  onClick={handleValidateGeminiApiKey}
                  sx={{ marginTop: 1 }}
                >
                  Validate Gemini API Key
                </Button>
                {geminiApiKeyValid === true && (
                  <FormHelperText sx={{ color: 'green' }}>
                    Gemini API Key is valid
                  </FormHelperText>
                )}
              </Grid>
              <Grid item xs={12}>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleCreateBlogWithAI}
                  sx={{ marginRight: 2 }}
                  disabled={
                    youtubeApiKeyValid !== true ||
                    geminiApiKeyValid !== true ||
                    loadingAI
                  }
                >
                  Create Blog With AI
                </Button>
                {loadingAI && <CircularProgress size={20} sx={{marginLeft: 1}} />}
                <Typography variant="subtitle1">Upload Photos</Typography>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageUpload}
                />
              </Grid>
              <Grid item xs={12}>
                <Button type="submit" variant="contained" color="primary">
                  Publish
                </Button>
              </Grid>
            </Grid>
          </form>
        </Box>
      );
    }

    export default TravelForm;
