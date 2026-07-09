from google import genai

client = genai.Client(api_key="AQ.Ab8RN6J3IHQRudrn5JD8xLWlqOasFTyX4nimg4uJRf4t60Y8Qw")

response = client.models.generate_content(
    model="gemini-2.5-flash",
    contents="Say hello in one sentence."
)

print(response.text)