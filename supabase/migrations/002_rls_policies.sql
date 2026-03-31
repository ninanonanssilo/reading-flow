ALTER TABLE teachers ENABLE ROW LEVEL SECURITY;
ALTER TABLE classrooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE error_reclassifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "teachers_own" ON teachers
  FOR ALL USING (id = auth.uid());

CREATE POLICY "classrooms_teacher" ON classrooms
  FOR ALL USING (teacher_id = auth.uid());

CREATE POLICY "students_access" ON students
  FOR ALL USING (
    classroom_id IN (SELECT id FROM classrooms WHERE teacher_id = auth.uid())
    OR id = auth.uid()
  );

CREATE POLICY "sessions_access" ON sessions
  FOR ALL USING (
    student_id = auth.uid()
    OR student_id IN (
      SELECT s.id FROM students s
      JOIN classrooms c ON s.classroom_id = c.id
      WHERE c.teacher_id = auth.uid()
    )
  );

CREATE POLICY "reclassifications_teacher" ON error_reclassifications
  FOR INSERT WITH CHECK (
    reclassified_by = auth.uid()
  );

CREATE POLICY "reclassifications_read" ON error_reclassifications
  FOR SELECT USING (
    session_id IN (SELECT id FROM sessions WHERE student_id IN (
      SELECT s.id FROM students s
      JOIN classrooms c ON s.classroom_id = c.id
      WHERE c.teacher_id = auth.uid()
    ))
  );
