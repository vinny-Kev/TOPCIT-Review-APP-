import axios from 'axios';
import { motion } from 'framer-motion';
import { useEffect, useMemo, useState, type FormEvent } from 'react';
import api from '../api/client';
import HeaderBar from '../components/HeaderBar';
import Sidebar from '../components/Sidebar';
import TopicsChart from '../components/charts/TopicsChart';
import { useAuth } from '../hooks/useAuth';

export type Section = 'dashboard' | 'flashcards' | 'tests' | 'progress' | 'notes';

interface Props {
  activeSection: Section;
  onChangeSection: (section: Section) => void;
  onOpenAdmin: () => void;
}

interface CategoryDTO {
  id: number;
  name: string;
  description?: string | null;
  color?: string | null;
  questionCount: number;
  completed: number;
  total: number;
}

interface FlashcardDTO {
  id: number;
  prompt: string;
  category: string;
  color?: string | null;
}

interface QuestionDTO {
  id: number;
  prompt: string;
  options: string[];
}

interface TestBreakdownRow {
  questionId: number;
  prompt: string;
  options: string[];
  selectedIndex: number | null;
  correctIndex: number | null;
  isCorrect: boolean;
}

interface TestResultDTO {
  answered: number;
  total: number;
  durationSec: number;
  correct: number;
  scorePercent: number;
  aiInsights?: string | null;
  breakdown: TestBreakdownRow[];
}

interface NoteDTO {
  id: number;
  title: string;
  content: string;
  updatedAt: string;
}

interface DocumentDTO {
  id: number;
  originalName: string;
  status: string;
  createdAt: string;
}

interface CustomFlashcardDTO {
  id: number;
  prompt: string;
  answer: string;
  tags?: string | null;
  createdAt: string;
}

interface CustomExamQuestionDTO {
  id: number;
  question: string;
  sampleAnswer?: string | null;
  difficulty?: string | null;
  createdAt: string;
}

interface ProgressPayload {
  summary: {
    topicsCovered: number;
    questionsPracticed: number;
    completionRate: number;
    testsTaken: number;
  };
  chart: { label: string; completed: number; total: number; percentage: number; color?: string | null }[];
}

const getChoiceLabel = (index: number) => String.fromCharCode(65 + index);

const DashboardPage = ({ activeSection, onChangeSection, onOpenAdmin }: Props) => {
  const { user } = useAuth();
  const currentYear = new Date().getFullYear();
  const [theme, setTheme] = useState<'light' | 'dark'>(
    () => (localStorage.getItem('topcit_theme') as 'light' | 'dark') || 'light'
  );
  const [categories, setCategories] = useState<CategoryDTO[]>([]);
  const [flashcards, setFlashcards] = useState<FlashcardDTO[]>([]);
  const [progress, setProgress] = useState<ProgressPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loadFailed, setLoadFailed] = useState(false);

  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [flippedCardId, setFlippedCardId] = useState<number | null>(null);

  const [notes, setNotes] = useState<NoteDTO[]>([]);
  const [documents, setDocuments] = useState<DocumentDTO[]>([]);
  const [customCards, setCustomCards] = useState<CustomFlashcardDTO[]>([]);
  const [customQuestions, setCustomQuestions] = useState<CustomExamQuestionDTO[]>([]);
  const [noteForm, setNoteForm] = useState({ title: '', content: '' });
  const [flashcardForm, setFlashcardForm] = useState({ prompt: '', answer: '', tags: '' });
  const [examForm, setExamForm] = useState({ question: '', sampleAnswer: '', difficulty: '' });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [submittingCustom, setSubmittingCustom] = useState(false);

  const [testCategory, setTestCategory] = useState<CategoryDTO | null>(null);
  const [testQuestions, setTestQuestions] = useState<QuestionDTO[]>([]);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [selectedOptions, setSelectedOptions] = useState<Record<number, number | null>>({});
  const [testResult, setTestResult] = useState<TestResultDTO | null>(null);
  const [testStart, setTestStart] = useState<number | null>(null);
  const currentQuestion = testCategory && testQuestions.length > 0 ? testQuestions[questionIndex] : null;

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('topcit_theme', theme);
  }, [theme]);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const [catRes, progressRes, flashRes, notesRes, docsRes, customCardsRes, customExamRes] = await Promise.all([
          api.get('/categories'),
          api.get('/progress'),
          api.get('/categories/flashcards/all'),
          api.get('/notes'),
          api.get('/documents'),
          api.get('/custom-content/flashcards'),
          api.get('/custom-content/exams')
        ]);
        setCategories(catRes.data.categories);
        setProgress(progressRes.data);
        setFlashcards(flashRes.data.cards);
        setNotes(notesRes.data.notes);
        setDocuments(docsRes.data.documents);
        setCustomCards(customCardsRes.data.cards);
        setCustomQuestions(customExamRes.data.questions);
        setLoading(false);
      } catch (err) {
        console.error(err);
        setError('Unable to load your learning data.');
        setLoadFailed(true);
        setLoading(false);
      }
    };
    load();
  }, []);

  const toggleTheme = () => setTheme((prev: 'light' | 'dark') => (prev === 'light' ? 'dark' : 'light'));

  const currentCard = flashcards[currentCardIndex];

  const stats = useMemo<{ label: string; value: string | number; icon: string; hint: string }[]>(() => {
    if (!progress) {
      return [];
    }
    return [
      { label: 'Topics', value: progress.summary.topicsCovered, icon: 'fa-brain', hint: 'active focus areas' },
      { label: 'Questions', value: progress.summary.questionsPracticed, icon: 'fa-circle-question', hint: 'answered so far' },
      { label: 'Completion', value: `${progress.summary.completionRate}%`, icon: 'fa-bullseye', hint: 'overall progress' },
      { label: 'Tests', value: progress.summary.testsTaken, icon: 'fa-trophy', hint: 'sessions logged' }
    ];
  }, [progress]);

  const startTest = async (categoryId: number) => {
    try {
      setError(null);
      const category = categories.find((cat: CategoryDTO) => cat.id === categoryId);
      if (!category) {
        setError('Category not found.');
        return;
      }
      const res = await api.get(`/categories/${categoryId}/questions`);
      const questions: QuestionDTO[] = (res.data.questions || [])
        .map((question: QuestionDTO) => ({
          ...question,
          options: Array.isArray(question.options) ? question.options : []
        }))
        .filter((question: QuestionDTO) => question.options.length >= 2);

      if (questions.length === 0) {
        setError('No multiple-choice questions are ready for this category yet.');
        return;
      }

      setTestCategory(category);
      setTestQuestions(questions);
      setQuestionIndex(0);
      setSelectedOptions({});
      setTestResult(null);
      setTestStart(Date.now());
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError('Failed to load questions');
      }
    }
  };

  const submitTest = async () => {
    if (!testCategory) return;
    setError(null);
    const durationSec = testStart ? Math.round((Date.now() - testStart) / 1000) : 0;

    try {
      const responsesPayload = testQuestions.map((question) => ({
        questionId: question.id,
        selectedIndex:
          typeof selectedOptions[question.id] === 'number' ? (selectedOptions[question.id] as number) : null
      }));

      const { data } = await api.post('/tests/session', {
        categoryId: testCategory.id,
        durationSec,
        responses: responsesPayload
      });

      setTestResult(data.result as TestResultDTO);
      setTestStart(null);

      const [progressRes, catRes] = await Promise.all([api.get('/progress'), api.get('/categories')]);
      setProgress(progressRes.data);
      setCategories(catRes.data.categories);
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError('Could not submit test.');
      }
    }
  };

  const handleOptionSelect = (questionId: number, optionIndex: number) => {
    setSelectedOptions((prev) => ({
      ...prev,
      [questionId]: optionIndex
    }));
  };

  const handleNoteSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!noteForm.title || !noteForm.content) {
      return;
    }
    try {
      setError(null);
      const { data } = await api.post('/notes', noteForm);
      setNotes((prev) => [data.note, ...prev]);
      setNoteForm({ title: '', content: '' });
    } catch (err) {
      setError('Unable to save note right now.');
    }
  };

  const handleDocumentUpload = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedFile) return;
    setUploading(true);
    try {
      setError(null);
      const formData = new FormData();
      formData.append('file', selectedFile);
      const { data } = await api.post('/documents/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setDocuments((prev) => [data.document, ...prev]);
      setSelectedFile(null);
      (event.target as HTMLFormElement).reset();
    } catch (err) {
      setError('Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteDocument = async (documentId: number) => {
    try {
      setError(null);
      await api.delete(`/documents/${documentId}`);
      setDocuments((prev) => prev.filter((doc) => doc.id !== documentId));
    } catch (err) {
      setError('Could not delete the document');
    }
  };

  const handleCustomFlashcardSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!flashcardForm.prompt || !flashcardForm.answer) {
      return;
    }
    setSubmittingCustom(true);
    try {
      setError(null);
      const { data } = await api.post('/custom-content/flashcards', {
        prompt: flashcardForm.prompt,
        answer: flashcardForm.answer,
        tags: flashcardForm.tags || undefined
      });
      setCustomCards((prev) => [data.card, ...prev]);
      setFlashcardForm({ prompt: '', answer: '', tags: '' });
      setFlashcards((prev) => [
        ...prev,
        {
          id: -data.card.id,
          prompt: data.card.prompt,
          category: 'Custom',
          color: '#6366f1'
        }
      ]);
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError('Unable to create flashcard');
      }
    } finally {
      setSubmittingCustom(false);
    }
  };

  const handleCustomExamSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!examForm.question) {
      return;
    }
    setSubmittingCustom(true);
    try {
      setError(null);
      const { data } = await api.post('/custom-content/exams', {
        question: examForm.question,
        sampleAnswer: examForm.sampleAnswer || undefined,
        difficulty: examForm.difficulty || undefined
      });
      setCustomQuestions((prev) => [data.question, ...prev]);
      setExamForm({ question: '', sampleAnswer: '', difficulty: '' });
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError('Unable to create custom exam question');
      }
    } finally {
      setSubmittingCustom(false);
    }
  };

  if (loading) {
    return <div className="loading-screen">Loading your personalized plan…</div>;
  }

  if (loadFailed && error) {
    return <div className="loading-screen error">{error}</div>;
  }

  return (
    <div className="app-grid">
      <Sidebar active={activeSection} onChange={onChangeSection} showAdmin={user?.role === 'ADMIN'} onAdmin={onOpenAdmin} />
      <div className="content">
        <HeaderBar onToggleTheme={toggleTheme} theme={theme} />
        {error && !loadFailed && <div className="inline-error">{error}</div>}
        {activeSection === 'dashboard' && (
          <section className="panel">
            <motion.div className="welcome-card" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}>
              <div>
                <h2>Good to see you 👋</h2>
                <p>Pick a topic, skim flashcards, then lock in with a focused test. Bite-sized tasks keep momentum.</p>
                <div className="cta-row">
                  <button onClick={() => onChangeSection('flashcards')}>Jump to Flashcards</button>
                  <button className="ghost" onClick={() => onChangeSection('tests')}>
                    Take a Practice Test
                  </button>
                </div>
              </div>
              {categories.length > 0 && (
                <TopicsChart
                  labels={categories.map((category) => category.name)}
                  data={categories.map((category) => category.questionCount)}
                  colors={categories.map((category) => category.color || '#8b0000')}
                />
              )}
            </motion.div>

            <div className="stats-grid">
              {stats.map((stat) => (
                <motion.div key={stat.label} className="stat-card" whileHover={{ translateY: -4 }}>
                  <i className={`fa-solid ${stat.icon}`} />
                  <div>
                    <p>{stat.label}</p>
                    <strong>{stat.value}</strong>
                    <small>{stat.hint}</small>
                  </div>
                </motion.div>
              ))}
            </div>
          </section>
        )}

        {activeSection === 'flashcards' && (
          <section className="panel flashcards">
            <div className="flashcards-header">
              <div className="title">
                <i className="fa-solid fa-clone" aria-hidden="true" />
                <div>
                  <h2>Flashcards</h2>
                  <p>Tap to flip and link each prompt to a real scenario.</p>
                </div>
              </div>
              <span>
                {flashcards.length > 0 ? `${currentCardIndex + 1} / ${flashcards.length}` : '0 / 0'}
              </span>
            </div>
            {currentCard ? (
              <>
                <div className="flashcard-meta">
                  <span>
                    <i className="fa-solid fa-tag" aria-hidden="true" />
                    {currentCard.category}
                  </span>
                  <span>
                    <i className="fa-solid fa-hand-pointer" aria-hidden="true" />
                    Tap anywhere on the card to flip
                  </span>
                </div>
                <div
                  className={`flashcard ${currentCard && flippedCardId === currentCard.id ? 'flipped' : ''}`}
                  onClick={() =>
                    setFlippedCardId((prev) => {
                      if (!currentCard) return null;
                      return prev === currentCard.id ? null : currentCard.id;
                    })
                  }
                  role="button"
                  tabIndex={0}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault();
                      setFlippedCardId((prev) => {
                        if (!currentCard) return null;
                        return prev === currentCard.id ? null : currentCard.id;
                      });
                    }
                  }}
                >
                  <div className="flashcard-face front" style={{ borderColor: currentCard.color || '#ffc0cb' }}>
                    <p>{currentCard.prompt}</p>
                    <span>{currentCard.category}</span>
                  </div>
                  <div className="flashcard-face back">
                    <p>Reflect on how you would explain this in your own words.</p>
                  </div>
                </div>
                <div className="flashcard-actions">
                  <button
                    type="button"
                    className="ghost"
                    onClick={() => {
                      setFlippedCardId(null);
                      setCurrentCardIndex((prev) => (prev - 1 + flashcards.length) % flashcards.length);
                    }}
                  >
                    <i className="fa-solid fa-arrow-left" aria-hidden="true" />
                    Previous
                  </button>
                  <button
                    type="button"
                    className="primary"
                    onClick={() => {
                      setFlippedCardId(null);
                      setCurrentCardIndex((prev) => (prev + 1) % flashcards.length);
                    }}
                  >
                    Next card
                    <i className="fa-solid fa-arrow-right" aria-hidden="true" />
                  </button>
                </div>
              </>
            ) : (
              <div className="empty-state">
                <p>Your flashcards will appear once questions sync from the server.</p>
                <button type="button" className="ghost" onClick={() => onChangeSection('tests')}>
                  Jump into a practice test
                </button>
              </div>
            )}
          </section>
        )}

        {activeSection === 'tests' && (
          <section className="panel tests">
            <h2>Practice Tests</h2>
            {!testCategory && (
              <div className="category-grid">
                {categories.map((category: CategoryDTO) => (
                  <motion.button key={category.id} className="category-card" whileHover={{ scale: 1.01 }} onClick={() => startTest(category.id)}>
                    <h3>{category.name}</h3>
                    <p>{category.description}</p>
                    <div className="tag">{category.questionCount} prompts</div>
                  </motion.button>
                ))}
                {categories.length === 0 && <p className="empty-state">Categories will appear after seeding the database.</p>}
              </div>
            )}

            {testCategory && currentQuestion && (
              <div className="test-runner">
                <div className="test-header">
                  <button
                    className="ghost"
                    onClick={() => {
                      setTestCategory(null);
                      setTestQuestions([]);
                      setTestResult(null);
                      setTestStart(null);
                      setSelectedOptions({});
                      setQuestionIndex(0);
                    }}
                  >
                    ← Categories
                  </button>
                  <div>
                    <strong>{testCategory.name}</strong>
                    <small>
                      Question {questionIndex + 1} / {testQuestions.length}
                    </small>
                  </div>
                </div>
                <div className="question-card">
                  <p>{currentQuestion.prompt}</p>
                  <ul className="option-list">
                    {currentQuestion.options.map((option, optionIndex) => {
                      const isSelected = selectedOptions[currentQuestion.id] === optionIndex;
                      return (
                        <li key={`${currentQuestion.id}-${optionIndex}`}>
                          <label className={`option-tile ${isSelected ? 'selected' : ''}`}>
                            <input
                              type="radio"
                              name={`question-${currentQuestion.id}`}
                              value={optionIndex}
                              checked={isSelected}
                              onChange={() => handleOptionSelect(currentQuestion.id, optionIndex)}
                            />
                            <span className="option-letter">{getChoiceLabel(optionIndex)}</span>
                            <span>{option}</span>
                          </label>
                        </li>
                      );
                    })}
                  </ul>
                </div>
                <div className="test-controls">
                  <button
                    disabled={questionIndex === 0}
                    onClick={() => setQuestionIndex((prev: number) => Math.max(0, prev - 1))}
                  >
                    Previous
                  </button>
                  {questionIndex === testQuestions.length - 1 ? (
                    <button className="primary" onClick={submitTest}>
                      Submit session
                    </button>
                  ) : (
                    <button onClick={() => setQuestionIndex((prev: number) => Math.min(testQuestions.length - 1, prev + 1))}>
                      Next
                    </button>
                  )}
                </div>
                {testResult && (
                  <div className="test-result">
                    <div className="score-pill">{testResult.scorePercent}%</div>
                    <p>
                      Correct {testResult.correct} / {testResult.total} • {testResult.durationSec}s
                    </p>
                    {testResult.aiInsights && (
                      <div className="ai-insights">
                        <h4>AI insights (stub)</h4>
                        <p>{testResult.aiInsights}</p>
                      </div>
                    )}
                    <div className="result-breakdown">
                      {testResult.breakdown.map((row) => {
                        const selectedLabel =
                          typeof row.selectedIndex === 'number'
                            ? `${getChoiceLabel(row.selectedIndex)}. ${row.options[row.selectedIndex] ?? '—'}`
                            : 'Not answered';
                        const correctLabel =
                          typeof row.correctIndex === 'number'
                            ? `${getChoiceLabel(row.correctIndex)}. ${row.options[row.correctIndex] ?? '—'}`
                            : 'N/A';
                        return (
                          <div key={row.questionId} className={`result-item ${row.isCorrect ? 'correct' : 'incorrect'}`}>
                            <strong>{row.prompt}</strong>
                            <span>Selected: {selectedLabel}</span>
                            {!row.isCorrect && <small>Correct: {correctLabel}</small>}
                          </div>
                        );
                      })}
                    </div>
                    <button className="ghost" onClick={() => startTest(testCategory.id)}>
                      Retake topic
                    </button>
                  </div>
                )}
              </div>
            )}

            {testCategory && testQuestions.length === 0 && (
              <div className="empty-state">
                <p>No questions are available for {testCategory.name} yet.</p>
                <button
                  className="ghost"
                  onClick={() => {
                    setTestCategory(null);
                    setTestQuestions([]);
                    setError(null);
                  }}
                >
                  ← Back to categories
                </button>
              </div>
            )}
          </section>
        )}

        {activeSection === 'progress' && progress && (
          <section className="panel progress">
            <h2>Your Progress</h2>
            <div className="progress-grid">
              {progress.chart.map((entry: ProgressPayload['chart'][number]) => (
                <div key={entry.label} className="progress-card">
                  <div className="card-header">
                    <h3>{entry.label}</h3>
                    <p>{entry.completed}/{entry.total} prompts</p>
                  </div>
                  <div className="progress-ring" style={{ borderColor: entry.color || undefined }}>
                    <span>{entry.percentage}%</span>
                  </div>
                  <div className="meta">Keep steady pace to hit 100%.</div>
                </div>
              ))}
            </div>
          </section>
        )}

        {activeSection === 'notes' && (
          <section className="panel notes">
            <h2>Knowledge Hub</h2>
            <p className="notes-subtitle">
              Capture quick notes, upload PDFs for upcoming AI parsing, and craft your own flashcards or exam prompts.
            </p>
            <div className="notes-layout">
              <div className="notes-column">
                <div className="section-header">
                  <h3>Your Notes</h3>
                  <span>{notes.length} saved</span>
                </div>
                {notes.length === 0 ? (
                  <div className="empty-state">
                    <p>No notes yet. Use the form on the right to add your first insight.</p>
                  </div>
                ) : (
                  <div className="note-list">
                    {notes.map((note) => (
                      <motion.div key={note.id} className="note-card" whileHover={{ translateY: -4 }}>
                        <h3>{note.title}</h3>
                        <p>{note.content}</p>
                        <small>Updated {new Date(note.updatedAt).toLocaleDateString()}</small>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
              <div className="notes-column">
                <div className="note-form-card">
                  <h3>Add Note</h3>
                  <form className="note-form" onSubmit={handleNoteSubmit}>
                    <label>
                      <span>Title</span>
                      <input value={noteForm.title} onChange={(event) => setNoteForm((prev) => ({ ...prev, title: event.target.value }))} placeholder="Sprint retro ideas" />
                    </label>
                    <label>
                      <span>Content</span>
                      <textarea
                        value={noteForm.content}
                        onChange={(event) => setNoteForm((prev) => ({ ...prev, content: event.target.value }))}
                        placeholder="Jot quick bullets or reminders"
                      />
                    </label>
                    <button type="submit" className="primary">Save note</button>
                  </form>
                </div>
                <div className="note-form-card">
                  <h3>Upload PDF for AI parsing</h3>
                  <form className="note-form" onSubmit={handleDocumentUpload}>
                    <input type="file" accept="application/pdf" onChange={(event) => setSelectedFile(event.target.files ? event.target.files[0] : null)} />
                    <button type="submit" className="primary" disabled={!selectedFile || uploading}>
                      {uploading ? 'Uploading…' : 'Upload & queue'}
                    </button>
                    <small>We store the file securely and queue it for your Ollama-powered assistant to parse.</small>
                  </form>
                  <ul className="document-list">
                    {documents.map((doc) => (
                      <li key={doc.id}>
                        <div>
                          <strong>{doc.originalName}</strong>
                          <small>Status: {doc.status.toLowerCase()}</small>
                        </div>
                        <button type="button" className="ghost" onClick={() => handleDeleteDocument(doc.id)}>
                          Remove
                        </button>
                      </li>
                    ))}
                    {documents.length === 0 && <small>No uploads yet.</small>}
                  </ul>
                </div>
              </div>
            </div>

            <div className="custom-content-grid">
              <div className="note-form-card">
                <div className="section-header">
                  <h3>Create Flashcards</h3>
                  <span>{customCards.length} custom</span>
                </div>
                <form className="note-form" onSubmit={handleCustomFlashcardSubmit}>
                  <label>
                    <span>Prompt</span>
                    <input value={flashcardForm.prompt} onChange={(event) => setFlashcardForm((prev) => ({ ...prev, prompt: event.target.value }))} placeholder="What is a blue/green deployment?" />
                  </label>
                  <label>
                    <span>Answer</span>
                    <textarea value={flashcardForm.answer} onChange={(event) => setFlashcardForm((prev) => ({ ...prev, answer: event.target.value }))} />
                  </label>
                  <label>
                    <span>Tags</span>
                    <input value={flashcardForm.tags} onChange={(event) => setFlashcardForm((prev) => ({ ...prev, tags: event.target.value }))} placeholder="devops,release" />
                  </label>
                  <button type="submit" className="primary" disabled={submittingCustom}>
                    {submittingCustom ? 'Saving…' : 'Add flashcard'}
                  </button>
                </form>
                <div className="custom-list">
                  {customCards.slice(0, 3).map((card) => (
                    <div key={card.id}>
                      <strong>{card.prompt}</strong>
                      <p>{card.answer}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="note-form-card">
                <div className="section-header">
                  <h3>Build Exam Questions</h3>
                  <span>{customQuestions.length} drafted</span>
                </div>
                <form className="note-form" onSubmit={handleCustomExamSubmit}>
                  <label>
                    <span>Question</span>
                    <textarea value={examForm.question} onChange={(event) => setExamForm((prev) => ({ ...prev, question: event.target.value }))} />
                  </label>
                  <label>
                    <span>Sample answer</span>
                    <textarea value={examForm.sampleAnswer} onChange={(event) => setExamForm((prev) => ({ ...prev, sampleAnswer: event.target.value }))} />
                  </label>
                  <label>
                    <span>Difficulty</span>
                    <input value={examForm.difficulty} onChange={(event) => setExamForm((prev) => ({ ...prev, difficulty: event.target.value }))} placeholder="Beginner / Intermediate / Advanced" />
                  </label>
                  <button type="submit" className="primary" disabled={submittingCustom}>
                    {submittingCustom ? 'Saving…' : 'Add question'}
                  </button>
                </form>
                <div className="custom-list">
                  {customQuestions.slice(0, 3).map((question) => (
                    <div key={question.id}>
                      <strong>{question.question}</strong>
                      {question.sampleAnswer && <p>{question.sampleAnswer}</p>}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>
        )}

        <footer className="app-footer">
          <p>
            © {currentYear} Kevin Roy Maglaqui &amp; Team Niel ASG. For more info contact{' '}
            <a href="mailto:2234101@slu.edu.ph">2234101@slu.edu.ph</a>.
          </p>
        </footer>
      </div>
    </div>
  );
};

export default DashboardPage;
