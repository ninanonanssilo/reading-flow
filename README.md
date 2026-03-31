# Reading Flow - 읽기 우주탐험대

**읽기 유창성 학습 웹 앱** | BASA 기반 읽기 분석 + 자기조절학습(SRL)

> **Live Demo**: https://reading-flow-3yq.pages.dev/

---

## 한국어

### 소개
Reading Flow는 초등학생의 **읽기 유창성(Reading Fluency)** 향상을 위한 웹 기반 학습 도구입니다. 음성 인식 기술을 활용하여 학생이 소리 내어 읽은 내용을 실시간 분석하고, BASA(기초학력검사) 기준으로 오류를 분류합니다.

### 주요 기능
- **음성 인식 기반 읽기 분석**: Web Speech API로 실시간 전사 및 BASA 오류 분류 (대치, 생략, 첨가, 반복, 자기교정)
- **자기조절학습(SRL) 지원**: 목표 설정 → 읽기 → 자기평가 → 결과 비교의 메타인지 학습 흐름
- **보상 시스템**: 별, 뱃지, 레벨업을 통한 학습 동기 부여
- **교사 대시보드**: 학생별 CWPM 추이, 오류 분포, 자기조절 수준 확인
- **회원 시스템**: 학생/교사 역할 분리, 개인정보 동의 관리

### 기술 스택
React + TypeScript + Vite + Tailwind CSS v4 + Cloudflare Pages

---

## English

### About
Reading Flow is a web-based learning tool designed to improve **reading fluency** for elementary school students. It uses speech recognition to analyze read-aloud performance in real-time and classifies errors based on the BASA (Basic Academic Skills Assessment) framework.

### Key Features
- **Speech Recognition Reading Analysis**: Real-time transcription via Web Speech API with BASA error classification (substitution, omission, addition, repetition, self-correction)
- **Self-Regulated Learning (SRL)**: Goal setting → Reading → Self-assessment → Result comparison for metacognitive learning
- **Reward System**: Stars, badges, and level-ups to motivate learners
- **Teacher Dashboard**: Track student CWPM trends, error distributions, and self-regulation levels
- **Auth System**: Separate student/teacher roles with privacy consent management

### Tech Stack
React + TypeScript + Vite + Tailwind CSS v4 + Cloudflare Pages

---

## Getting Started

```bash
npm install
npm run dev
```

Open http://localhost:5173 in your browser.

## Build & Deploy

```bash
npm run build
npx wrangler pages deploy dist --project-name=reading-flow
```

## License

MIT
