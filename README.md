## About
I created **_Echodiary_**, a user-friendly diary-making Web App using AWS Amplify Gen 2. Echodiary allows users to document their daily experiences by talking to our mascot _Echo_, which transcribes voice to text, or by writing entries manually. Users can enhance their diary entries with photos, making memories more vivid. The app features a one-click AI Content Enhancement ✨ to improve grammar and structure. Additionally, _AI-generated_ weekly highlights and personalized suggestions help users reflect on their week and improve mental health and personal growth.

Echodiary combines advanced technology with user-friendly features to offer a seamless and enriching diary-keeping experience.

#### Creating New Diary Entry
![New Diary](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/xtzbot6hxjdeoijjwbga.png)

#### Diary Entry with Mood Analysis
![mood](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/zkn2s65ierxc9fwlg0w2.png)

#### Landing Page
![Landing](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/j932ljt61673izh2fa84.png)


### Connected Components and Feature Full

- **Data:** 
The diary entries are securely stored in Amplify Storage (DynamoDB) with authorization rules ensuring that only the diary owner has access.
- **Authentication:**
The users are authenticated using Amplify Auth(Cognito) to access the Dashboard and create diary entries.
- **File Storage:**
Users can add images to the Diary Entries which are securely stored in Private/Protected S3 Buckets using Amplify Storage
- **Serverless Function:** I utilize a serverless function to invoke the _AWS Bedrock_ Model (mistral-7b-instruct) for enhancing diary text content and generating weekly highlights for users.
- **Connected Components:** I used the Authenticator Connected Component to manage user authentication and the Storage Image and Storage Manager components to handle images within diary entries.

#### Additional Features
- **AWS Bedrock:** I used AWS Bedrock to enhance the diary text content and to generate the Weekly Highlights using Mistral AI's  mistral-7b-instruct model.
- **Amplify AI/ML Predictions (AWS Comprehend):** I used Amplify Predictions to perform Sentiment Analysis of the user's diary to analyze their mood.
- **Voice Enabled Diaries:** I used the [Web Speech Recognition API](https://developer.mozilla.org/en-US/docs/Web/API/SpeechRecognition) to let users express their thoughts with their voice and transcribe them into the diary text.
- **AI Content Enhancement:** I used AWS Bedrock to enhance the diary's text content and improve the grammar and structure and also to generate Weekly Highlights.

![System Architecture](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/7labebwyyb6k525l8mbf.png)