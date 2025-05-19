const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

function showMessage(msg) {
  document.getElementById("output").innerText = msg;
  console.log(msg);
}

if (!SpeechRecognition) {
  console.error("SpeechRecognition not supported");
} else {
  const r = new SpeechRecognition();
  r.continuous = false;
  r.interimResults = false;
  r.maxAlternatives = 1;

  r.onstart = () => {
    showMessage("Speech recognition started...");
  };

  r.onresult = async (event) => {
    const transcript = event.results[0][0].transcript;
    showMessage(`You said: ${transcript}`);

    const result = await callGemini(transcript);
    const text = result.candidates[0].content.parts[0].text;
    showMessage(`Kate: ${text}`);

    await speak(text);
  };

  async function callGemini(text) {
    const body = {
      system_instruction: {
        parts: [
          {
            text: "You are a smart and helpful voice assistant named Kate. You assist a student named Utkarsh Singh. Respond briefly and emotionally, keeping in mind that the interaction will be converted to voice."
          }
        ]
      },
      contents: [
        {
          parts: [{ text }]
        }
      ]
    };

    const API_KEY = 'AIzaSyBGLzZHBPv9ptSQcXRKoiQ1i6UsFGA1R_Q';
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      }
    );

    return await response.json();
  }

  async function speak(text) {
    const API_KEY = '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';
    const response = await fetch('https://api.openai.com/v1/audio/speech', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: "gpt-4o-mini-tts",
        voice: "nova",
        input: text,
        instructions: "You are an assistant named Kate. You assist a student named Utkarsh Singh. Speak emotionally and briefly so it's easy to understand as voice.",
        response_format: "mp3"
      })
    });

    const audioBlob = await response.blob();
    const url = URL.createObjectURL(audioBlob);
    const audio = document.getElementById("audio");
    audio.src = url;
    audio.play();
  }

  r.start();
  console.log("Started");
}
