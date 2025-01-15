import React from 'react';
import { diffWords } from 'diff'

// Function to phonemize ground truth
export const phonemizeText = async (settings, text) => {
    const phonemizationUrl = settings.phonemizationUrl;

    console.log("phonemizationUrl", phonemizationUrl);

    if (!phonemizationUrl) {
        console.error('Phonemization URL is not set.');
        return text; // Fallback to raw text if the service is unavailable
    }

    try {
        const response = await fetch(phonemizationUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text: text }),
        });

        if (response.ok) {
            const data = await response.json();
            return data.phonemized_text || text;
        } else {
            console.error('Failed to phonemize:', response.statusText);
            return text; // Fallback to raw text
        }
    } catch (error) {
        console.error('Error during phonemization:', error);
        return text; // Fallback to raw text
    }
};

export const generateFileContent = async (settings, project, samples, phonemized = false) => {
    const result = [];

    for (const sample of samples) {
        const phonemizedText = phonemized
            ? await phonemizeText(settings, sample.ground_truth)
            : sample.ground_truth;

        result.push(
            `${sample.id}-24.wav|${phonemizedText}|${project.author_id || '0'}`
        );
    }

    return result.join('\n');
};

export const randomThemes = [
    'friendship',
    'adventure',
    'mystery',
    'discovery',
    'kindness',
    'growth',
    'courage',
    'perseverance',
    'dreams',
    'imagination',
    'nature',
    'technology',
    'space exploration',
    'magic',
    'science',
    'time travel',
    'justice',
    'betrayal',
    'redemption',
    'curiosity',
    'harmony',
    'family',
    'art',
    'creativity',
    'healing',
    'resilience',
    'freedom',
    'truth',
    'hope',
    'wisdom',
];

export const preprocessText = (text) => {
    return text
        .toLowerCase() // Normalize casing
        .replace(/[\p{P}$+<=>^`|~]/gu, '') // Remove punctuation
        .split(/\s+/) // Split into words
        .filter(Boolean); // Remove empty strings
};

export const highlightDifferences = (groundTruth, transcriptionText) => {
    const groundWords = preprocessText(groundTruth);
    const transcriptionWords = preprocessText(transcriptionText);
  
    const diff = diffWords(groundWords.join(' '), transcriptionWords.join(' '));
  
    return diff.map((part, index) => {
      const style = part.added
        ? { color: 'red', backgroundColor: 'black' } // Highlight extra words
        : part.removed
          ? { textDecoration: 'line-through', color: 'white', backgroundColor: 'black' } // Highlight missing words
          : {};
      return (
        <span key={index} style={style}>
          {part.value}{' '}
        </span>
      );
    });
  };
