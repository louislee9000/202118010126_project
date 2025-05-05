"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Question } from "@/types/question";
import { Course } from "@/types/course";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, X, Code, CheckSquare, ToggleLeft } from "lucide-react";
import Link from "next/link";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface PracticeListProps {
  initialQuestions: Question[];
  initialCourses: Course[];
}

export default function PracticeList({ initialQuestions, initialCourses }: PracticeListProps) {
  const [questions, setQuestions] = useState<Question[]>(initialQuestions);
  const [filteredQuestions, setFilteredQuestions] = useState<Question[]>(initialQuestions);
  const [courses, setCourses] = useState<Course[]>(initialCourses);
  const [searchTerm, setSearchTerm] = useState("");
  const [courseFilter, setCourseFilter] = useState("all");
  const [difficultyFilter, setDifficultyFilter] = useState("all");
  const [questionTypeFilter, setQuestionTypeFilter] = useState("all");
  const [activeTab, setActiveTab] = useState("all");

  const getCourseTitle = (courseId: string) => {
    const course = courses.find(c => c.id === courseId);
    return course?.title || 'Unknown Course';
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'easy':
        return 'bg-green-500';
      case 'medium':
        return 'bg-yellow-500';
      case 'hard':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getQuestionTypeIcon = (type: string) => {
    switch (type) {
      case 'programming':
        return <Code className="h-4 w-4 mr-1" />;
      case 'multiple_choice':
        return <CheckSquare className="h-4 w-4 mr-1" />;
      case 'true_false':
        return <ToggleLeft className="h-4 w-4 mr-1" />;
      default:
        return null;
    }
  };

  const getQuestionTypeColor = (type: string) => {
    switch (type) {
      case 'programming':
        return 'bg-blue-100 text-blue-800';
      case 'multiple_choice':
        return 'bg-purple-100 text-purple-800';
      case 'true_false':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Apply filters
  const applyFilters = () => {
    let filtered = [...questions];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (question) =>
          question.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          question.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply course filter
    if (courseFilter !== "all") {
      filtered = filtered.filter((question) => question.courseId === courseFilter);
    }

    // Apply difficulty filter
    if (difficultyFilter !== "all") {
      filtered = filtered.filter((question) => question.difficulty === difficultyFilter);
    }

    // Apply question type filter from tabs
    if (activeTab !== "all") {
      filtered = filtered.filter((question) => question.questionType === activeTab);
    }

    setFilteredQuestions(filtered);
  };

  // Update filters when any filter changes
  useEffect(() => {
    applyFilters();
  }, [searchTerm, courseFilter, difficultyFilter, questions, activeTab]);

  // Clear search
  const clearSearch = () => {
    setSearchTerm("");
  };

  // Group questions by type for counting
  const questionCounts = {
    all: questions.length,
    multiple_choice: questions.filter(q => q.questionType === 'multiple_choice').length,
    true_false: questions.filter(q => q.questionType === 'true_false').length,
    programming: questions.filter(q => q.questionType === 'programming').length,
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Practice Questions</h1>
      
      {/* Question Type Tabs */}
      <Tabs defaultValue="all" className="mb-6" onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all">
            All ({questionCounts.all})
          </TabsTrigger>
          <TabsTrigger value="multiple_choice">
            <CheckSquare className="h-4 w-4 mr-1" /> Multiple Choice ({questionCounts.multiple_choice})
          </TabsTrigger>
          <TabsTrigger value="true_false">
            <ToggleLeft className="h-4 w-4 mr-1" /> True/False ({questionCounts.true_false})
          </TabsTrigger>
          <TabsTrigger value="programming">
            <Code className="h-4 w-4 mr-1" /> Programming ({questionCounts.programming})
          </TabsTrigger>
        </TabsList>
      </Tabs>
      
      {/* Filters */}
      <Card className="p-6 mb-6">
        <div className="flex flex-col md:flex-row gap-4 items-end">
          <div className="flex-1">
            <label className="text-sm font-medium mb-1 block">Search Questions</label>
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by title or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
              {searchTerm && (
                <button
                  onClick={clearSearch}
                  className="absolute right-2.5 top-2.5 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>

          <div className="w-full md:w-48">
            <label className="text-sm font-medium mb-1 block">Filter by Course</label>
            <Select value={courseFilter} onValueChange={setCourseFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Select course" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Courses</SelectItem>
                {courses.map((course) => (
                  <SelectItem key={course.id} value={course.id}>
                    {course.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="w-full md:w-48">
            <label className="text-sm font-medium mb-1 block">Filter by Difficulty</label>
            <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Select difficulty" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Difficulties</SelectItem>
                <SelectItem value="easy">Easy</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="hard">Hard</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>

      {/* Questions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredQuestions.length === 0 ? (
          <div className="col-span-full text-center py-8">
            <p className="text-muted-foreground">No questions found</p>
            {(searchTerm || courseFilter !== "all" || difficultyFilter !== "all" || activeTab !== "all") && (
              <Button
                variant="link"
                onClick={() => {
                  setSearchTerm("");
                  setCourseFilter("all");
                  setDifficultyFilter("all");
                  setActiveTab("all");
                }}
                className="mt-2"
              >
                Clear filters
              </Button>
            )}
          </div>
        ) : (
          filteredQuestions.map((question) => (
            <Card key={question.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle className="text-xl">{question.title}</CardTitle>
                  <div className="flex flex-col space-y-1 items-end">
                    <Badge className={getDifficultyColor(question.difficulty)}>
                      {question.difficulty}
                    </Badge>
                    <Badge className={getQuestionTypeColor(question.questionType)} variant="outline">
                      <div className="flex items-center">
                        {getQuestionTypeIcon(question.questionType)}
                        <span className="capitalize">{question.questionType.replace('_', ' ')}</span>
                      </div>
                    </Badge>
                  </div>
                </div>
                <CardDescription>
                  Course: {getCourseTitle(question.courseId)}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 line-clamp-3">{question.description}</p>
              </CardContent>
              <CardFooter>
                <Link href={`/practice/${question.id}`} className="w-full">
                  <Button className="w-full">Start Practice</Button>
                </Link>
              </CardFooter>
            </Card>
          ))
        )}
      </div>
    </div>
  );
} 