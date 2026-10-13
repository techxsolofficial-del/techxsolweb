import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';

export default function ToolsPage() {
  const [searchParams] = useSearchParams();
  const [activeFilter, setActiveFilter] = useState('all');

  // Digit Tool State
  const [digitMode, setDigitMode] = useState('analyzer');
  const [digitInput, setDigitInput] = useState('');
  const [calcDisplay, setCalcDisplay] = useState('0');
  const [calcHistory, setCalcHistory] = useState('Ready');

  // CGPA Calculator State
  const [courses, setCourses] = useState([
    { id: 1, name: 'Web Engineering', credits: 3, grade: 4.0 },
    { id: 2, name: 'Database Systems', credits: 4, grade: 3.7 },
    { id: 3, name: 'Data Structures & Algorithms', credits: 3, grade: 3.3 },
    { id: 4, name: 'Software Architecture', credits: 3, grade: 4.0 }
  ]);
  const [prevCgpa, setPrevCgpa] = useState('');
  const [prevCredits, setPrevCredits] = useState('');

  // Percentage Tool State
  const [percentageMode, setPercentageMode] = useState('marks');
  const [obtainedMarks, setObtainedMarks] = useState('920');
  const [totalMarks, setTotalMarks] = useState('1100');
  const [f1Percent, setF1Percent] = useState('20');
  const [f1Total, setF1Total] = useState('1500');
  const [f2Part, setF2Part] = useState('75');
  const [f2Whole, setF2Whole] = useState('300');
  const [f3Old, setF3Old] = useState('50');
  const [f3New, setF3New] = useState('75');

  // Sync tool from URL
  useEffect(() => {
    const toolParam = searchParams.get('tool');
    if (toolParam && ['digit', 'cgpa', 'percentage'].includes(toolParam)) {
      setActiveFilter(toolParam);
      const targetElement = document.getElementById(`${toolParam}-tool`) || document.getElementById(`${toolParam}-calculator`);
      if (targetElement) {
        setTimeout(() => {
          targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 150);
      }
    }
  }, [searchParams]);

  // ===================
  // DIGIT ANALYZER
  // ===================
  const analyzeDigits = () => {
    const digitsOnly = digitInput.replace(/\D/g, '');
    const totalDigits = digitsOnly.length;
    const charCount = digitInput.length;
    const wordCount = digitInput.trim() ? digitInput.trim().split(/\s+/).length : 0;
    
    let sum = 0;
    const counts = { 0:0, 1:0, 2:0, 3:0, 4:0, 5:0, 6:0, 7:0, 8:0, 9:0 };
    for (let char of digitsOnly) {
      const d = parseInt(char, 10);
      counts[d] = (counts[d] || 0) + 1;
      sum += d;
    }
    const distinctDigits = Object.values(counts).filter(c => c > 0).length;

    return { totalDigits, distinctDigits, sum, wordCount, charCount, counts, digitsOnly };
  };

  const digitStats = analyzeDigits();

  const handleExtractDigits = () => {
    setDigitInput(digitStats.digitsOnly);
  };

  const handleCopyDigits = () => {
    if (digitStats.digitsOnly) {
      navigator.clipboard?.writeText(digitStats.digitsOnly);
      alert('Extracted digits copied to clipboard!');
    }
  };

  // ===================
  // CALCULATOR LOGIC
  // ===================
  const handleCalcInput = (char) => {
    if (calcDisplay === '0' && !isNaN(char)) {
      setCalcDisplay(char);
    } else {
      setCalcDisplay(prev => prev + char);
    }
  };

  const handleCalcAction = (action) => {
    if (action === 'C') {
      setCalcDisplay('0');
      setCalcHistory('Ready');
    } else if (action === 'BACK') {
      setCalcDisplay(prev => prev.length > 1 ? prev.slice(0, -1) : '0');
    } else if (action === 'NEG') {
      if (calcDisplay !== '0') {
        if (calcDisplay.startsWith('-')) {
          setCalcDisplay(calcDisplay.slice(1));
        } else {
          setCalcDisplay('-' + calcDisplay);
        }
      }
    }
  };

  const handleCalcEvaluate = () => {
    try {
      // Safe sanitized eval
      const sanitized = calcDisplay.replace(/[^0-9+\-*/.%]/g, '');
      const res = Function(`'use strict'; return (${sanitized})`)();
      setCalcHistory(calcDisplay + ' =');
      setCalcDisplay(String(Number(res.toFixed(8))));
    } catch (e) {
      setCalcHistory('Error');
      setCalcDisplay('0');
    }
  };

  // ===================
  // CGPA CALCULATIONS
  // ===================
  const addCourse = () => {
    const newId = courses.length ? Math.max(...courses.map(c => c.id)) + 1 : 1;
    setCourses([...courses, { id: newId, name: `Course ${newId}`, credits: 3, grade: 4.0 }]);
  };

  const removeCourse = (id) => {
    if (courses.length > 1) {
      setCourses(courses.filter(c => c.id !== id));
    }
  };

  const updateCourse = (id, field, value) => {
    setCourses(courses.map(c => {
      if (c.id === id) {
        return { ...c, [field]: field === 'credits' || field === 'grade' ? parseFloat(value) || 0 : value };
      }
      return c;
    }));
  };

  const resetCgpa = () => {
    setCourses([
      { id: 1, name: 'Subject 1', credits: 3, grade: 4.0 },
      { id: 2, name: 'Subject 2', credits: 3, grade: 3.5 },
      { id: 3, name: 'Subject 3', credits: 4, grade: 3.0 }
    ]);
    setPrevCgpa('');
    setPrevCredits('');
  };

  let totalCredits = 0;
  let totalQualityPoints = 0;
  courses.forEach(c => {
    const cred = c.credits || 0;
    const grd = c.grade !== undefined ? c.grade : 4.0;
    totalCredits += cred;
    totalQualityPoints += (cred * grd);
  });
  const semesterGpa = totalCredits > 0 ? (totalQualityPoints / totalCredits) : 0;

  let cumulativeCgpa = null;
  const pCgpa = parseFloat(prevCgpa);
  const pCredits = parseFloat(prevCredits);
  if (!isNaN(pCgpa) && !isNaN(pCredits) && pCredits > 0) {
    const prevPoints = pCgpa * pCredits;
    const overallCredits = pCredits + totalCredits;
    cumulativeCgpa = overallCredits > 0 ? ((prevPoints + totalQualityPoints) / overallCredits).toFixed(2) : null;
  }

  const getAcademicStanding = (gpa) => {
    if (gpa >= 3.8) return 'Dean’s Honor List / Summa Cum Laude';
    if (gpa >= 3.5) return 'Magna Cum Laude / High Honors';
    if (gpa >= 3.0) return 'Good Standing / Honors';
    if (gpa >= 2.5) return 'Satisfactory Standing';
    if (gpa >= 2.0) return 'Academic Warning Threshold';
    return 'Probation Standing';
  };

  // ===================
  // PERCENTAGE CALCULATIONS
  // ===================
  const calcMarks = () => {
    const obt = parseFloat(obtainedMarks) || 0;
    const tot = parseFloat(totalMarks) || 1;
    const pct = Math.min(100, Math.max(0, (obt / tot) * 100));
    const lost = Math.max(0, tot - obt);

    let grade = 'F';
    let status = 'Failed';
    if (pct >= 90) { grade = 'A+'; status = '1st Div (Distinction)'; }
    else if (pct >= 80) { grade = 'A'; status = '1st Div (Excellent)'; }
    else if (pct >= 70) { grade = 'B'; status = '1st Div (Good)'; }
    else if (pct >= 60) { grade = 'C'; status = '2nd Div (Fair)'; }
    else if (pct >= 50) { grade = 'D'; status = '2nd Div (Pass)'; }
    else if (pct >= 40) { grade = 'E'; status = '3rd Div (Pass)'; }

    return { pct: pct.toFixed(2), grade, status, lost };
  };

  const marksData = calcMarks();

  const formula1Result = () => {
    const p = parseFloat(f1Percent) || 0;
    const tot = parseFloat(f1Total) || 0;
    return ((p / 100) * tot).toFixed(2);
  };

  const formula2Result = () => {
    const part = parseFloat(f2Part) || 0;
    const whole = parseFloat(f2Whole) || 1;
    return ((part / whole) * 100).toFixed(2) + '%';
  };

  const formula3Result = () => {
    const oldV = parseFloat(f3Old) || 1;
    const newV = parseFloat(f3New) || 0;
    const diff = ((newV - oldV) / oldV) * 100;
    return (diff >= 0 ? '+' : '') + diff.toFixed(2) + '%';
  };

  return (
    <div className="tool-workspace" style={{ paddingTop: '100px', minHeight: '80vh' }}>
      {/* Hero Header */}
      <section className="tools-hero">
        <div className="section-title" style={{ marginBottom: 0 }}>
          <span className="section-tag">Interactive Utilities Suite</span>
          <h2>Smart Developer & Academic Tools</h2>
          <p>Precision utilities engineered for instant calculation, digital counting, and academic GPA performance.</p>
        </div>

        {/* Filter Navigation */}
        <div className="tools-nav-filter">
          <button
            className={`tool-filter-btn ${activeFilter === 'all' ? 'active' : ''}`}
            onClick={() => setActiveFilter('all')}
          >
            <i className="fa-solid fa-shapes"></i> All Tools
          </button>
          <button
            className={`tool-filter-btn ${activeFilter === 'digit' ? 'active' : ''}`}
            onClick={() => setActiveFilter('digit')}
          >
            <i className="fa-solid fa-calculator"></i> Digit & Calculator
          </button>
          <button
            className={`tool-filter-btn ${activeFilter === 'cgpa' ? 'active' : ''}`}
            onClick={() => setActiveFilter('cgpa')}
          >
            <i className="fa-solid fa-graduation-cap"></i> CGPA & GPA Calculator
          </button>
          <button
            className={`tool-filter-btn ${activeFilter === 'percentage' ? 'active' : ''}`}
            onClick={() => setActiveFilter('percentage')}
          >
            <i className="fa-solid fa-percent"></i> Percentage & Marks
          </button>
        </div>
      </section>

      {/* Main Workspace */}
      <main className="tool-workspace" style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 20px 80px' }}>
        
        {/* =========================================
            TOOL 1: SMART DIGITAL & DIGIT CALCULATOR
           ========================================= */}
        {(activeFilter === 'all' || activeFilter === 'digit') && (
          <section className="tool-box" id="digit-tool">
            <div className="tool-box-header">
              <div className="tool-box-icon"><i className="fa-solid fa-calculator"></i></div>
              <div>
                <h3>Smart Digital & Digit Calculator</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '14px', margin: 0 }}>
                  Count numbers, analyze digit-by-digit frequencies in text, or use the interactive digital calculator with history.
                </p>
              </div>
            </div>

            <div className="tool-subtabs">
              <button
                className={`subtab-btn ${digitMode === 'analyzer' ? 'active' : ''}`}
                onClick={() => setDigitMode('analyzer')}
              >
                <i className="fa-solid fa-chart-simple"></i> Digit & Number Analyzer
              </button>
              <button
                className={`subtab-btn ${digitMode === 'calculator' ? 'active' : ''}`}
                onClick={() => setDigitMode('calculator')}
              >
                <i className="fa-solid fa-calculator"></i> Digital Calculator
              </button>
            </div>

            {digitMode === 'analyzer' ? (
              <div>
                <div className="form-group">
                  <label style={{ fontWeight: 700, marginBottom: '6px', display: 'block' }}>
                    Paste or Type Your Text / Digits:
                  </label>
                  <textarea
                    className="form-control"
                    style={{ minHeight: '120px' }}
                    placeholder="Type or paste any text, phone numbers, numeric codes, or text with numbers (e.g. Total order: 450 items, invoice #9821, pin 4029)..."
                    value={digitInput}
                    onChange={(e) => setDigitInput(e.target.value)}
                  ></textarea>
                </div>

                <div className="stats-counter-grid">
                  <div className="stat-counter-card">
                    <div className="stat-counter-num">{digitStats.totalDigits}</div>
                    <div className="stat-counter-label">Total Digits (0-9)</div>
                  </div>
                  <div className="stat-counter-card">
                    <div className="stat-counter-num">{digitStats.distinctDigits}</div>
                    <div className="stat-counter-label">Distinct Digits</div>
                  </div>
                  <div className="stat-counter-card">
                    <div className="stat-counter-num">{digitStats.sum}</div>
                    <div className="stat-counter-label">Sum of Digits</div>
                  </div>
                  <div className="stat-counter-card">
                    <div className="stat-counter-num">{digitStats.wordCount}</div>
                    <div className="stat-counter-label">Total Words</div>
                  </div>
                  <div className="stat-counter-card">
                    <div className="stat-counter-num">{digitStats.charCount}</div>
                    <div className="stat-counter-label">Characters</div>
                  </div>
                </div>

                <label style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginTop: '16px' }}>
                  DIGIT FREQUENCY BREAKDOWN (0 - 9):
                </label>
                <div className="digit-freq-grid">
                  {Object.keys(digitStats.counts).map(digit => (
                    <div key={digit} className="digit-freq-pill">
                      <div className="digit-val">{digit}</div>
                      <div className="freq-badge">{digitStats.counts[digit]}</div>
                    </div>
                  ))}
                </div>

                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginTop: '20px' }}>
                  <button onClick={handleExtractDigits} className="btn-primary" style={{ padding: '10px 20px', fontSize: '14px' }}>
                    <i className="fa-solid fa-filter"></i> Extract Digits Only
                  </button>
                  <button onClick={handleCopyDigits} className="btn-secondary" style={{ padding: '10px 20px', fontSize: '14px' }}>
                    <i className="fa-regular fa-copy"></i> Copy Digits
                  </button>
                  <button onClick={() => setDigitInput('')} className="btn-secondary" style={{ padding: '10px 20px', fontSize: '14px', color: '#EF4444' }}>
                    <i className="fa-solid fa-trash"></i> Clear Text
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <div className="calculator-frame">
                  <div className="calc-screen">
                    <div className="calc-history">{calcHistory}</div>
                    <div className="calc-main-num">{calcDisplay}</div>
                  </div>

                  <div className="calc-keypad">
                    <button className="calc-btn calc-btn-action" onClick={() => handleCalcAction('C')}>C</button>
                    <button className="calc-btn calc-btn-action" onClick={() => handleCalcAction('BACK')}><i className="fa-solid fa-delete-left"></i></button>
                    <button className="calc-btn calc-btn-op" onClick={() => handleCalcInput('%')}>%</button>
                    <button className="calc-btn calc-btn-op" onClick={() => handleCalcInput('/')}>÷</button>

                    <button className="calc-btn calc-btn-num" onClick={() => handleCalcInput('7')}>7</button>
                    <button className="calc-btn calc-btn-num" onClick={() => handleCalcInput('8')}>8</button>
                    <button className="calc-btn calc-btn-num" onClick={() => handleCalcInput('9')}>9</button>
                    <button className="calc-btn calc-btn-op" onClick={() => handleCalcInput('*')}>×</button>

                    <button className="calc-btn calc-btn-num" onClick={() => handleCalcInput('4')}>4</button>
                    <button className="calc-btn calc-btn-num" onClick={() => handleCalcInput('5')}>5</button>
                    <button className="calc-btn calc-btn-num" onClick={() => handleCalcInput('6')}>6</button>
                    <button className="calc-btn calc-btn-op" onClick={() => handleCalcInput('-')}>−</button>

                    <button className="calc-btn calc-btn-num" onClick={() => handleCalcInput('1')}>1</button>
                    <button className="calc-btn calc-btn-num" onClick={() => handleCalcInput('2')}>2</button>
                    <button className="calc-btn calc-btn-num" onClick={() => handleCalcInput('3')}>3</button>
                    <button className="calc-btn calc-btn-op" onClick={() => handleCalcInput('+')}>+</button>

                    <button className="calc-btn calc-btn-action" onClick={() => handleCalcAction('NEG')}>±</button>
                    <button className="calc-btn calc-btn-num" onClick={() => handleCalcInput('0')}>0</button>
                    <button className="calc-btn calc-btn-num" onClick={() => handleCalcInput('.')}>.</button>
                    <button className="calc-btn calc-btn-equal" onClick={handleCalcEvaluate}>=</button>
                  </div>
                </div>
              </div>
            )}
          </section>
        )}

        {/* =========================================
            TOOL 2: SEMESTER CGPA & GPA CALCULATOR
           ========================================= */}
        {(activeFilter === 'all' || activeFilter === 'cgpa') && (
          <section className="tool-box" id="cgpa-calculator">
            <div className="tool-box-header">
              <div className="tool-box-icon"><i className="fa-solid fa-graduation-cap"></i></div>
              <div>
                <h3>Semester CGPA & GPA Calculator</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '14px', margin: 0 }}>
                  Calculate your semester GPA & cumulative CGPA across university credit hours based on the standard 4.0 grading system.
                </p>
              </div>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table className="cgpa-table">
                <thead>
                  <tr>
                    <th style={{ width: '45%' }}>Course / Subject Name</th>
                    <th style={{ width: '25%' }}>Credit Hours</th>
                    <th style={{ width: '25%' }}>Grade Achieved</th>
                    <th style={{ width: '5%', textAlign: 'center' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {courses.map((course) => (
                    <tr key={course.id}>
                      <td>
                        <input
                          type="text"
                          className="form-control"
                          value={course.name}
                          onChange={(e) => updateCourse(course.id, 'name', e.target.value)}
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          step="0.5"
                          min="1"
                          max="6"
                          className="form-control"
                          value={course.credits}
                          onChange={(e) => updateCourse(course.id, 'credits', e.target.value)}
                        />
                      </td>
                      <td>
                        <select
                          className="form-control"
                          value={course.grade}
                          onChange={(e) => updateCourse(course.id, 'grade', e.target.value)}
                        >
                          <option value="4.0">A+ / A (4.00 - 85%+)</option>
                          <option value="3.7">A- (3.70 - 80-84%)</option>
                          <option value="3.3">B+ (3.30 - 75-79%)</option>
                          <option value="3.0">B (3.00 - 70-74%)</option>
                          <option value="2.7">B- (2.70 - 65-69%)</option>
                          <option value="2.3">C+ (2.30 - 61-64%)</option>
                          <option value="2.0">C (2.00 - 58-60%)</option>
                          <option value="1.7">C- (1.70 - 55-57%)</option>
                          <option value="1.0">D (1.00 - 50-54%)</option>
                          <option value="0.0">F (0.00 - Fail)</option>
                        </select>
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <button
                          type="button"
                          onClick={() => removeCourse(course.id)}
                          style={{ background: 'none', border: 'none', color: '#EF4444', cursor: 'pointer', fontSize: '16px' }}
                        >
                          <i className="fa-solid fa-trash-can"></i>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', margin: '18px 0' }}>
              <button onClick={addCourse} className="btn-primary" style={{ padding: '10px 20px', fontSize: '14px' }}>
                <i className="fa-solid fa-plus"></i> Add Course
              </button>
              <button onClick={resetCgpa} className="btn-secondary" style={{ padding: '10px 20px', fontSize: '14px', color: '#EF4444' }}>
                <i className="fa-solid fa-rotate-left"></i> Reset
              </button>
            </div>

            {/* Optional Cumulative Previous CGPA Box */}
            <div style={{ background: '#F8FAFC', border: '1px solid var(--border-color)', borderRadius: '14px', padding: '20px', marginTop: '24px' }}>
              <div style={{ fontWeight: 700, marginBottom: '12px', color: 'var(--text-main)' }}>
                <i className="fa-solid fa-layer-group" style={{ color: 'var(--accent-cyan)', marginRight: '6px' }}></i>
                Cumulative CGPA Tracker (Optional)
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label style={{ fontSize: '13px' }}>Previous Cumulative CGPA</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="4"
                    className="form-control"
                    placeholder="e.g. 3.45"
                    value={prevCgpa}
                    onChange={(e) => setPrevCgpa(e.target.value)}
                  />
                </div>
                <div className="form-group" style={{ margin: 0 }}>
                  <label style={{ fontSize: '13px' }}>Previous Total Credit Hours</label>
                  <input
                    type="number"
                    step="1"
                    min="0"
                    max="200"
                    className="form-control"
                    placeholder="e.g. 45"
                    value={prevCredits}
                    onChange={(e) => setPrevCredits(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Dynamic Results Dashboard */}
            <div className="gpa-result-banner" id="cgpaResultBanner">
              <div>
                <div style={{ fontSize: '14px', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>
                  Semester GPA
                </div>
                <div className="gpa-score-large">{semesterGpa.toFixed(2)}</div>
                <div className="gpa-badge">{getAcademicStanding(semesterGpa)}</div>
              </div>

              <div style={{ borderLeft: '1px solid #334155', paddingLeft: '24px', minWidth: '220px' }}>
                <div style={{ marginBottom: '8px' }}>
                  <span style={{ color: '#94A3B8', fontSize: '13.5px' }}>Semester Credits:</span>
                  <strong style={{ color: '#FFFFFF', fontSize: '15px', marginLeft: '6px' }}>{totalCredits}</strong>
                </div>
                <div style={{ marginBottom: '8px' }}>
                  <span style={{ color: '#94A3B8', fontSize: '13.5px' }}>Quality Points:</span>
                  <strong style={{ color: '#FFFFFF', fontSize: '15px', marginLeft: '6px' }}>{totalQualityPoints.toFixed(2)}</strong>
                </div>
                {cumulativeCgpa && (
                  <div style={{ marginTop: '10px', paddingTop: '10px', borderTop: '1px dashed #475569' }}>
                    <span style={{ color: '#38BDF8', fontSize: '13.5px', fontWeight: 700 }}>Overall CGPA:</span>
                    <strong style={{ color: '#38BDF8', fontSize: '18px', marginLeft: '6px' }}>{cumulativeCgpa}</strong>
                  </div>
                )}
              </div>
            </div>
          </section>
        )}

        {/* =========================================
            TOOL 3: PERCENTAGE & MARKS CALCULATOR
           ========================================= */}
        {(activeFilter === 'all' || activeFilter === 'percentage') && (
          <section className="tool-box" id="percentage-calculator">
            <div className="tool-box-header">
              <div className="tool-box-icon"><i className="fa-solid fa-percent"></i></div>
              <div>
                <h3>Percentage & Marks Calculator</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '14px', margin: 0 }}>
                  Calculate student exam marks percentage, letter grades, percentage differences, and proportions instantly.
                </p>
              </div>
            </div>

            <div className="tool-subtabs">
              <button
                className={`subtab-btn ${percentageMode === 'marks' ? 'active' : ''}`}
                onClick={() => setPercentageMode('marks')}
              >
                <i className="fa-solid fa-award"></i> Exam Marks to %
              </button>
              <button
                className={`subtab-btn ${percentageMode === 'ratios' ? 'active' : ''}`}
                onClick={() => setPercentageMode('ratios')}
              >
                <i className="fa-solid fa-calculator"></i> Quick % Ratios & Change
              </button>
            </div>

            {percentageMode === 'marks' ? (
              <div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
                  <div className="form-group">
                    <label style={{ fontWeight: 700 }}>Obtained Marks *</label>
                    <input
                      type="number"
                      step="0.5"
                      className="form-control"
                      value={obtainedMarks}
                      onChange={(e) => setObtainedMarks(e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label style={{ fontWeight: 700 }}>Total Maximum Marks *</label>
                    <input
                      type="number"
                      step="1"
                      className="form-control"
                      value={totalMarks}
                      onChange={(e) => setTotalMarks(e.target.value)}
                    />
                  </div>
                </div>

                <div className="percentage-meter-wrap">
                  <div className="percentage-meter-bar" style={{ width: `${marksData.pct}%` }}></div>
                </div>

                <div className="stats-counter-grid">
                  <div className="stat-counter-card">
                    <div className="stat-counter-num">{marksData.pct}%</div>
                    <div className="stat-counter-label">Percentage</div>
                  </div>
                  <div className="stat-counter-card">
                    <div className="stat-counter-num">{marksData.grade}</div>
                    <div className="stat-counter-label">Grade Assigned</div>
                  </div>
                  <div className="stat-counter-card">
                    <div className="stat-counter-num" style={{ fontSize: '18px' }}>{marksData.status}</div>
                    <div className="stat-counter-label">Division / Result</div>
                  </div>
                  <div className="stat-counter-card">
                    <div className="stat-counter-num">{marksData.lost}</div>
                    <div className="stat-counter-label">Marks Lost</div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '12px', marginTop: '18px' }}>
                  <button
                    onClick={() => { setObtainedMarks('945'); setTotalMarks('1100'); }}
                    className="btn-secondary"
                    style={{ padding: '8px 18px', fontSize: '13.5px' }}
                  >
                    Example: Matric/FSc (945/1100)
                  </button>
                  <button
                    onClick={() => { setObtainedMarks('82'); setTotalMarks('100'); }}
                    className="btn-secondary"
                    style={{ padding: '8px 18px', fontSize: '13.5px' }}
                  >
                    Example: Course (82/100)
                  </button>
                </div>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '24px' }}>
                {/* Formula 1 */}
                <div style={{ background: '#F8FAFC', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '18px' }}>
                  <div style={{ fontWeight: 700, marginBottom: '12px', color: 'var(--text-main)' }}>
                    Formula 1: What is X% of Y?
                  </div>
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
                    <span>What is</span>
                    <input
                      type="number"
                      className="form-control"
                      style={{ width: '100px' }}
                      value={f1Percent}
                      onChange={(e) => setF1Percent(e.target.value)}
                    />
                    <span>% of</span>
                    <input
                      type="number"
                      className="form-control"
                      style={{ width: '130px' }}
                      value={f1Total}
                      onChange={(e) => setF1Total(e.target.value)}
                    />
                    <span>=</span>
                    <strong style={{ fontSize: '20px', color: 'var(--accent-dark)' }}>{formula1Result()}</strong>
                  </div>
                </div>

                {/* Formula 2 */}
                <div style={{ background: '#F8FAFC', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '18px' }}>
                  <div style={{ fontWeight: 700, marginBottom: '12px', color: 'var(--text-main)' }}>
                    Formula 2: X is what percent of Y?
                  </div>
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
                    <input
                      type="number"
                      className="form-control"
                      style={{ width: '120px' }}
                      value={f2Part}
                      onChange={(e) => setF2Part(e.target.value)}
                    />
                    <span>is what % of</span>
                    <input
                      type="number"
                      className="form-control"
                      style={{ width: '120px' }}
                      value={f2Whole}
                      onChange={(e) => setF2Whole(e.target.value)}
                    />
                    <span>=</span>
                    <strong style={{ fontSize: '20px', color: 'var(--accent-dark)' }}>{formula2Result()}</strong>
                  </div>
                </div>

                {/* Formula 3 */}
                <div style={{ background: '#F8FAFC', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '18px' }}>
                  <div style={{ fontWeight: 700, marginBottom: '12px', color: 'var(--text-main)' }}>
                    Formula 3: Percentage Change (Increase / Decrease)
                  </div>
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
                    <span>From</span>
                    <input
                      type="number"
                      className="form-control"
                      style={{ width: '120px' }}
                      value={f3Old}
                      onChange={(e) => setF3Old(e.target.value)}
                    />
                    <span>to</span>
                    <input
                      type="number"
                      className="form-control"
                      style={{ width: '120px' }}
                      value={f3New}
                      onChange={(e) => setF3New(e.target.value)}
                    />
                    <span>=</span>
                    <strong style={{ fontSize: '20px', color: 'var(--accent-dark)' }}>{formula3Result()}</strong>
                  </div>
                </div>
              </div>
            )}
          </section>
        )}
      </main>
    </div>
  );
}
