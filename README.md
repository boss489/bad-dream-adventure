# bad dream adventure

파스텔 동화풍 Phaser 액션 게임.

**플레이:** https://boss489.github.io/bad-dream-adventure/

방향키/WASD 또는 화면 조이스틱으로 이동하고, 스페이스/공격 버튼을 놓으면 공격합니다. Shift/회피 버튼으로 회피합니다. 마을의 꿈나라 가게 → 주인 → 오른쪽 침대에서 원정을 시작합니다.

## 빌드

Node.js 24.21.0 / npm 11.19.0, Phaser 3.90.0.

```sh
npm ci
npm run build
cp artifacts/bad-dream-adventure-armed-scroll.html index.html
```

플레이 파일에는 필요한 코드·이미지·엔진이 모두 내장되어 있습니다. 의존성 설치에는 인터넷이 필요하지만 다운로드한 HTML 실행에는 외부 자원 요청이 없습니다.

GitHub Pages는 main 브랜치 루트의 index.html을 제공합니다. 저장 데이터는 브라우저/접속 출처별로 분리되므로 기존 로컬 HTML의 저장 데이터가 이 주소로 자동 이전되지 않습니다. 실제 휴대폰 전 기종 호환성과 장시간 성능은 보장하지 않습니다.

공개 범위는 현재 게임·빌드 소스·사용 이미지입니다. 내부 작업 기록, 인증정보, 실패한 이미지 생성 원본과 진단 로그는 포함하지 않습니다. 무기 이미지의 일부 중간 동작은 컷아웃 변형이며 타 게임의 이미지·음원·코드는 사용하지 않았습니다. Phaser 저작권/MIT 고지는 배포 HTML에 내장되어 있습니다.
