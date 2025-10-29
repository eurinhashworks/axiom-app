import React, { useState } from 'react';
import Button from './ui/Button';
import Card from './ui/Card';

interface ChatBotProps {
  onSubmit: (transcript: string) => void;
  isLoading?: boolean;
}

const ChatBot: React.FC<ChatBotProps> = ({ onSubmit, isLoading = false }) => {
    const [text, setText] = useState('');
    const [charCount, setCharCount] = useState(0);

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const value = e.target.value;
        setText(value);
        setCharCount(value.length);
    };

    const handleSubmit = () => {
        if (text.trim() && text.trim().length >= 10) {
            onSubmit(text.trim());
            setText('');
            setCharCount(0);
        }
    };

    const isTooShort = text.trim().length > 0 && text.trim().length < 10;

    return (
        <Card className="w-full max-w-2xl mx-auto animate-fade-in hover:shadow-lg transition-shadow">
            <div className="text-center mb-4">
                <h2 className="text-xl font-semibold">Brain Dump</h2>
                <p className="text-muted-foreground">
                    Écrivez tout ce qui concerne votre idée. Ne vous souciez pas de la structure.
                </p>
            </div>
            <div className="mb-2">
                <textarea
                    value={text}
                    onChange={handleChange}
                    className={`w-full h-64 p-4 border rounded-md bg-input text-foreground focus:outline-none focus:ring-2 transition-all resize-none ${
                        isTooShort 
                            ? 'border-yellow-500 focus:ring-yellow-500' 
                            : 'border-border focus:ring-brand'
                    }`}
                    placeholder="Mon idée concerne..."
                    disabled={isLoading}
                    aria-invalid={isTooShort}
                    aria-describedby={isTooShort ? 'char-warning' : undefined}
                />
                <div className="flex justify-between items-center mt-2">
                    {isTooShort && (
                        <p id="char-warning" className="text-sm text-yellow-600 dark:text-yellow-400" role="alert">
                            Minimum 10 caractères requis ({text.trim().length}/10)
                        </p>
                    )}
                    <p className={`text-xs ml-auto ${charCount > 5000 ? 'text-red-500' : 'text-muted-foreground'}`}>
                        {charCount}/5000 caractères
                    </p>
                </div>
            </div>
            <div className="flex justify-end mt-4">
                <Button 
                    onClick={handleSubmit} 
                    disabled={!text.trim() || isLoading || isTooShort || charCount > 5000}
                    isLoading={isLoading}
                >
                    Analyser l'idée
                </Button>
            </div>
        </Card>
    );
};

export default ChatBot;
