# 데이터베이스 모델링 도구

dbdiagram.io에서 영감을 받은 현대적인 웹 기반 데이터베이스 모델링 도구입니다. 직관적인 드래그 앤 드롭 인터페이스로 데이터베이스 스키마를 생성, 시각화 및 내보낼 수 있습니다.

🔗 **라이브 데모**: [https://v0-database-modeling-tool.vercel.app/](https://v0-database-modeling-tool.vercel.app/)

## 주요 기능

### 핵심 기능
- **시각적 스키마 디자인**: 드래그 앤 드롭 인터페이스로 데이터베이스 테이블 생성
- **관계 관리**: 1:N 표기법(까마귀 발)으로 외래 키 관계를 시각적으로 정의
- **컬럼 설정**: 
  - 컬럼 추가/제거
  - 데이터 타입 설정 (VARCHAR, INT, TEXT, DATE, TIMESTAMP 등)
  - 제약조건 설정 (Primary Key, Foreign Key, NOT NULL, UNIQUE)
  - 테이블 및 컬럼에 주석 추가

### 내보내기 옵션
- **SQL 생성**: 제약조건이 포함된 CREATE TABLE 문을 자동 생성
- **JSON 내보내기/가져오기**: 스키마 디자인을 저장하고 불러오기
- **SVG 내보내기**: 다이어그램을 확장 가능한 벡터 그래픽으로 내보내기
- **로컬 스토리지**: 브라우저 저장소에 자동 저장

### 사용자 경험
- **다크 테마**: 장시간 사용에 최적화된 전문적인 다크 인터페이스
- **그리드 캔버스**: 시각적 그리드 배경으로 정밀한 정렬
- **실시간 업데이트**: 디자인하는 즉시 SQL 미리보기
- **반응형 레이아웃**: 3패널 레이아웃 (툴바, 캔버스, 코드 패널)

## 기술 스택

- **프레임워크**: Next.js 16 (App Router)
- **언어**: TypeScript
- **스타일링**: Tailwind CSS v4
- **UI 컴포넌트**: shadcn/ui + Radix UI
- **아이콘**: Lucide React

## 시작하기

### 사전 요구사항
- Node.js 18+ 
- pnpm (권장) 또는 npm

### 설치

1. 저장소 클론:
```bash
git clone https://github.com/your-username/database-modeling-tool.git
cd database-modeling-tool
```

2. 의존성 설치:
```bash
pnpm install
# 또는
npm install
```

3. 개발 서버 실행:
```bash
pnpm dev
# 또는
npm run dev
```

4. 브라우저에서 [http://localhost:3000](http://localhost:3000) 열기

### 프로덕션 빌드
```bash
pnpm build
pnpm start
```

## 사용 가이드

### 테이블 생성
1. 툴바에서 **"Add Table"** 클릭
2. 사이드바에 테이블 이름 입력
3. **"Add Column"** 버튼으로 컬럼 추가
4. 각 컬럼 설정:
   - 컬럼 이름 설정
   - 데이터 타입 선택
   - 제약조건 체크 (PK, FK, NOT NULL, UNIQUE)
   - 선택적으로 주석 추가

### 관계 정의
1. 컬럼에서 **FK (Foreign Key)** 체크박스 선택
2. 드롭다운에서 참조할 테이블 선택
3. 참조할 컬럼 선택
4. 캔버스에 시각적 관계선이 표시됩니다

### 작업 내보내기
- **Export JSON**: 스키마 디자인을 나중에 사용하기 위해 저장
- **Import JSON**: 이전에 저장한 스키마 불러오기
- **Export SVG**: 다이어그램을 이미지로 다운로드
- **Copy SQL**: "Copy SQL"을 클릭하여 모든 CREATE TABLE 문 복사

### 테이블 이동
- 캔버스에서 테이블을 클릭하고 드래그하여 위치 조정
- 관계선이 자동으로 업데이트됩니다

## 프로젝트 구조

```
├── app/
│   ├── page.tsx           # 메인 애플리케이션 페이지
│   ├── layout.tsx         # 루트 레이아웃
│   └── globals.css        # 전역 스타일 및 테마 변수
├── components/
│   ├── toolbar.tsx        # 상단 툴바
│   ├── sidebar.tsx        # 테이블 편집용 왼쪽 사이드바
│   ├── diagram-canvas.tsx # 드래그 앤 드롭이 가능한 메인 캔버스
│   ├── table-node.tsx     # 개별 테이블 컴포넌트
│   └── code-panel.tsx     # 생성된 SQL을 표시하는 오른쪽 패널
└── public/                # 정적 자산
```

## 단축키

- **드래그**: 클릭하고 길게 눌러 테이블 이동
- **삭제**: 테이블 선택 후 사이드바의 삭제 버튼 사용

## 로드맵

- [ ] 다중 다이어그램 지원
- [ ] 협업 편집
- [ ] 데이터베이스 연결 및 리버스 엔지니어링
- [ ] 더 많은 내보내기 형식 (PNG, PDF)
- [ ] 다크/라이트 테마 토글
- [ ] 실행 취소/다시 실행 기능
- [ ] 테이블 복제
- [ ] 스키마 버전 관리

## 기여하기

기여를 환영합니다! Pull Request를 자유롭게 제출해주세요.

## 라이선스

MIT 라이선스 - 개인 또는 상업적 목적으로 자유롭게 사용 가능합니다.

## 감사의 말

- [dbdiagram.io](https://dbdiagram.io/)에서 영감을 받았습니다
- Vercel의 [v0.dev](https://v0.dev/)로 제작되었습니다
- [shadcn/ui](https://ui.shadcn.com/)의 UI 컴포넌트 사용

---

Next.js와 v0.dev로 만들었습니다 ❤️
