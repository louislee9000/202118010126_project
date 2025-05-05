"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CheckCircle2, XCircle, AlertCircle } from "lucide-react";
import { Question } from "@/types/question";

interface PracticeQuestionProps {
  question: Question;
}

export default function PracticeQuestion({ question }: PracticeQuestionProps) {
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [submittedCode, setSubmittedCode] = useState<string>("");
  const [language, setLanguage] = useState("javascript");
  const [jsCode, setJsCode] = useState(question.code || `function solution(arr) {\n  // Your code here\n  \n}\n\n// Example usage:\n// solution([1, 2, 3, 4, 5])`);
  const [pythonCode, setPythonCode] = useState(`def solution(arr):\n    # Your code here\n    pass\n\n# Example usage:\n# solution([1, 2, 3, 4, 5])`);

  const handleAnswerChange = (value: string) => {
    setSelectedAnswer(value);
    setShowFeedback(false);
  };

  const handleCodeChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (language === "javascript") {
      setJsCode(event.target.value);
    } else {
      setPythonCode(event.target.value);
    }
  };

  const handleResetCode = () => {
    if (language === "javascript") {
      setJsCode(question.code || `function solution(arr) {\n  // Your code here\n  \n}\n\n// Example usage:\n// solution([1, 2, 3, 4, 5])`);
    } else {
      setPythonCode(`def solution(arr):\n    # Your code here\n    pass\n\n# Example usage:\n# solution([1, 2, 3, 4, 5])`);
    }
    setShowFeedback(false);
  };

  const handleSubmitAnswer = () => {
    if (!selectedAnswer) return;
    
    if (question.questionType === 'multiple_choice' && question.options) {
      // Check if the selected answer index matches the correct_answer
      setIsCorrect(Number(selectedAnswer) === question.options.correct_answer);
      setShowFeedback(true);
    } else if (question.questionType === 'true_false') {
      // Check if the selected answer matches the correctAnswer
      setIsCorrect(selectedAnswer === question.correctAnswer);
      setShowFeedback(true);
    }
  };

  const handleSubmitCode = () => {
    const code = language === "javascript" ? jsCode : pythonCode;
    setSubmittedCode(code);
    // In a real application, you would evaluate the code here
    // For now, we just show a message that it was submitted
    setShowFeedback(true);
    setIsCorrect(true); // This would depend on actual evaluation
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <Link href="/practice">
          <Button variant="outline" size="sm">
            ← Back to Practice
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Question Description */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-start">
                <CardTitle>{question.title}</CardTitle>
                <Badge className={getDifficultyColor(question.difficulty)}>{question.difficulty}</Badge>
              </div>
              <CardDescription>{question.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Question Type</h3>
                  <p className="mt-1 capitalize">
                    {question.questionType.replace('_', ' ')}
                  </p>
                </div>
                
                {question.questionType === 'programming' && (
                  <>
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground">Instructions</h3>
                      <p className="mt-1">
                        Implement the solution according to the requirements.
                      </p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground">Example Input</h3>
                      <pre className="mt-1 p-2 bg-muted rounded-md text-sm overflow-x-auto">
                        <code>{`[1, 2, 3, 4, 5]`}</code>
                      </pre>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground">Example Output</h3>
                      <pre className="mt-1 p-2 bg-muted rounded-md text-sm overflow-x-auto">
                        <code>{`15`}</code>
                      </pre>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground">Constraints</h3>
                      <ul className="mt-1 list-disc list-inside text-sm">
                        <li>Time complexity: O(n)</li>
                        <li>Space complexity: O(1)</li>
                        <li>1 ≤ array.length ≤ 10^5</li>
                      </ul>
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Answer Section */}
        <div className="lg:col-span-2">
          {/* Programming Question */}
          {question.questionType === 'programming' && (
            <Card className="h-full">
              <CardHeader>
                <CardTitle>Solution</CardTitle>
                <CardDescription>Write your code below</CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="javascript" onValueChange={setLanguage}>
                  <TabsList className="mb-4">
                    <TabsTrigger value="javascript">JavaScript</TabsTrigger>
                    <TabsTrigger value="python">Python</TabsTrigger>
                  </TabsList>

                  <TabsContent value="javascript" className="h-[450px]">
                    <div className="h-full border rounded-md p-4 bg-muted">
                      <textarea
                        className="w-full h-full bg-transparent resize-none font-mono text-sm outline-none"
                        value={jsCode}
                        onChange={handleCodeChange}
                      />
                    </div>
                  </TabsContent>

                  <TabsContent value="python" className="h-[450px]">
                    <div className="h-full border rounded-md p-4 bg-muted">
                      <textarea
                        className="w-full h-full bg-transparent resize-none font-mono text-sm outline-none"
                        value={pythonCode}
                        onChange={handleCodeChange}
                      />
                    </div>
                  </TabsContent>
                </Tabs>

                {showFeedback && (
                  <Alert className="mt-4" variant={isCorrect ? "default" : "destructive"}>
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>{isCorrect ? "Solution Submitted" : "Error"}</AlertTitle>
                    <AlertDescription>
                      {isCorrect
                        ? "Your solution has been submitted for evaluation."
                        : "There was an error evaluating your solution. Please try again."}
                    </AlertDescription>
                  </Alert>
                )}

                <div className="flex justify-between mt-4">
                  <Button variant="outline" onClick={handleResetCode}>Reset</Button>
                  <div className="space-x-2">
                    <Button onClick={handleSubmitCode}>Submit Solution</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Multiple Choice Question */}
          {question.questionType === 'multiple_choice' && question.options && (
            <Card className="h-full">
              <CardHeader>
                <CardTitle>Choose the Correct Answer</CardTitle>
                <CardDescription>Select one option from the list below</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <RadioGroup value={selectedAnswer || ""} onValueChange={handleAnswerChange}>
                    {question.options.options.map((option, index) => (
                      <div key={index} className="flex items-center space-x-2 py-2">
                        <RadioGroupItem value={String(index)} id={`option-${index}`} />
                        <Label htmlFor={`option-${index}`} className="text-base">
                          {option}
                        </Label>
                        {showFeedback && Number(selectedAnswer) === index && (
                          <span className="ml-2">
                            {index === question.options?.correct_answer ? (
                              <CheckCircle2 className="h-5 w-5 text-green-500" />
                            ) : (
                              <XCircle className="h-5 w-5 text-red-500" />
                            )}
                          </span>
                        )}
                      </div>
                    ))}
                  </RadioGroup>
                  
                  {showFeedback && (
                    <Alert className={isCorrect ? "bg-green-50" : "bg-red-50"}>
                      {isCorrect ? (
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-500" />
                      )}
                      <AlertTitle>{isCorrect ? "Correct!" : "Incorrect"}</AlertTitle>
                      <AlertDescription>
                        {isCorrect 
                          ? "Great job! You selected the correct answer." 
                          : `The correct answer is: ${question.options.options[question.options.correct_answer]}`}
                      </AlertDescription>
                    </Alert>
                  )}

                  <div className="flex justify-end">
                    <Button onClick={handleSubmitAnswer} disabled={!selectedAnswer}>Submit Answer</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* True/False Question */}
          {question.questionType === 'true_false' && (
            <Card className="h-full">
              <CardHeader>
                <CardTitle>True or False?</CardTitle>
                <CardDescription>Select whether the statement is true or false</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <RadioGroup value={selectedAnswer || ""} onValueChange={handleAnswerChange}>
                    <div className="flex items-center space-x-2 py-2">
                      <RadioGroupItem value="true" id="true" />
                      <Label htmlFor="true" className="text-base">True</Label>
                      {showFeedback && selectedAnswer === "true" && (
                        <span className="ml-2">
                          {question.correctAnswer === "true" ? (
                            <CheckCircle2 className="h-5 w-5 text-green-500" />
                          ) : (
                            <XCircle className="h-5 w-5 text-red-500" />
                          )}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center space-x-2 py-2">
                      <RadioGroupItem value="false" id="false" />
                      <Label htmlFor="false" className="text-base">False</Label>
                      {showFeedback && selectedAnswer === "false" && (
                        <span className="ml-2">
                          {question.correctAnswer === "false" ? (
                            <CheckCircle2 className="h-5 w-5 text-green-500" />
                          ) : (
                            <XCircle className="h-5 w-5 text-red-500" />
                          )}
                        </span>
                      )}
                    </div>
                  </RadioGroup>

                  {showFeedback && (
                    <Alert className={isCorrect ? "bg-green-50" : "bg-red-50"}>
                      {isCorrect ? (
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-500" />
                      )}
                      <AlertTitle>{isCorrect ? "Correct!" : "Incorrect"}</AlertTitle>
                      <AlertDescription>
                        {isCorrect 
                          ? "Great job! You selected the correct answer." 
                          : `The correct answer is: ${question.correctAnswer === "true" ? "True" : "False"}`}
                      </AlertDescription>
                    </Alert>
                  )}

                  <div className="flex justify-end">
                    <Button onClick={handleSubmitAnswer} disabled={!selectedAnswer}>Submit Answer</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

// Helper function to get difficulty badge color
function getDifficultyColor(difficulty: string) {
  switch (difficulty) {
    case "easy":
      return "bg-green-100 text-green-800"
    case "medium":
      return "bg-yellow-100 text-yellow-800"
    case "hard":
      return "bg-red-100 text-red-800"
    default:
      return "bg-gray-100 text-gray-800"
  }
} 