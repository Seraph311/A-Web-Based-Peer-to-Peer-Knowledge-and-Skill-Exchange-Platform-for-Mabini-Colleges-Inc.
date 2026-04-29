CREATE DATABASE studybridge_db;

\c studybridge_db;

CREATE TABLE users (
    user_id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    department VARCHAR(255),
    role VARCHAR(50) NOT NULL,
    id_number VARCHAR(100) UNIQUE NOT NULL,
    contribution_points INT DEFAULT 0,
    badge_level VARCHAR(50) DEFAULT 'Member',
    is_available BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE skills (
    skill_id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(user_id) ON DELETE CASCADE,
    skill_name VARCHAR(255) NOT NULL,
    description TEXT,
    is_available BOOLEAN DEFAULT TRUE
);

CREATE TABLE forum_questions (
    question_id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(user_id) ON DELETE CASCADE,
    title VARCHAR(500) NOT NULL,
    content TEXT NOT NULL,
    topic_tag VARCHAR(255),
    department_tag VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP
);

CREATE TABLE forum_answers (
    answer_id SERIAL PRIMARY KEY,
    question_id INT REFERENCES forum_questions(question_id) ON DELETE CASCADE,
    user_id INT REFERENCES users(user_id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    upvotes INT DEFAULT 0,
    downvotes INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP
);

CREATE TABLE answer_votes (
    vote_id SERIAL PRIMARY KEY,
    answer_id INT NOT NULL REFERENCES forum_answers(answer_id) ON DELETE CASCADE,
    user_id INT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    vote_type VARCHAR(10) NOT NULL CHECK (vote_type IN ('upvote', 'downvote')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(answer_id, user_id)
);

CREATE TABLE sessions (
    session_id SERIAL PRIMARY KEY,
    creator_id INT REFERENCES users(user_id) ON DELETE CASCADE,
    session_type VARCHAR(50) NOT NULL,
    skill_id INT REFERENCES skills(skill_id) ON DELETE SET NULL,
    topic VARCHAR(500),
    status VARCHAR(50) DEFAULT 'open',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ended_at TIMESTAMP
);

CREATE TABLE session_participants (
    participant_id SERIAL PRIMARY KEY,
    session_id INT REFERENCES sessions(session_id) ON DELETE CASCADE,
    user_id INT REFERENCES users(user_id) ON DELETE CASCADE,
    role VARCHAR(50),
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE messages (
    message_id SERIAL PRIMARY KEY,
    session_id INT REFERENCES sessions(session_id) ON DELETE CASCADE,
    sender_id INT REFERENCES users(user_id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE feedback (
    feedback_id SERIAL PRIMARY KEY,
    session_id INT REFERENCES sessions(session_id) ON DELETE CASCADE,
    reviewer_id INT REFERENCES users(user_id) ON DELETE CASCADE,
    reviewed_user_id INT REFERENCES users(user_id) ON DELETE CASCADE,
    feedback_type VARCHAR(20) DEFAULT 'session',
    rating INT CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CHECK (feedback_type IN ('session', 'direct'))
);

CREATE TABLE reports (
    report_id SERIAL PRIMARY KEY,
    reporter_id INT REFERENCES users(user_id) ON DELETE CASCADE,
    content_type VARCHAR(100),
    content_id INT,
    reason TEXT,
    status VARCHAR(50) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
