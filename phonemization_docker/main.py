from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import subprocess

app = FastAPI()

class TextInput(BaseModel):
    text: str

@app.post("/phonemize/")
async def phonemize_text(input: TextInput):
    try:
        # Command to call espeak for phonemization
        command = [
            "espeak",
            "--ipa",         # Use IPA phoneme output (or "--phonout" for non-IPA)
            input.text
        ]

        # Execute the command and capture the output
        result = subprocess.run(
            command,
            capture_output=True,
            text=True,
            check=True,
        )

        # Strip new lines and unnecessary spaces from the output
        phonemized_text = result.stdout.replace('\n', ' ').strip()

        # Check if the output is empty
        if not phonemized_text:
            raise HTTPException(status_code=500, detail="Phonemization returned empty output.")

        return {"phonemized_text": phonemized_text}

    except FileNotFoundError:
        raise HTTPException(status_code=500, detail="espeak is not installed or not found in PATH.")
    except subprocess.CalledProcessError as e:
        raise HTTPException(
            status_code=500,
            detail=f"Phonemization failed: {e.stderr.strip() or 'Unknown error.'}"
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Unexpected error: {str(e)}")
