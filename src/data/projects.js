import ez2 from '../assets/images/projects/ezboard/ez2.png';
import fe2 from '../assets/images/projects/feelyeon/fe2.png';
import fe3 from '../assets/images/projects/feelyeon/fe3.png';
import fe4 from '../assets/images/projects/feelyeon/fe4.png';
import wi2 from '../assets/images/projects/withme/wi2.png';
import wi3 from '../assets/images/projects/withme/wi3.png';
import wi4 from '../assets/images/projects/withme/wi4.png';
import wi5 from '../assets/images/projects/withme/wi5.png';
import wi6 from '../assets/images/projects/withme/wi6.png';
import ne2 from '../assets/images/projects/nexspace/ne2.png';
import ne3 from '../assets/images/projects/nexspace/ne3.png';
import ne4 from '../assets/images/projects/nexspace/ne4.png';
import ne5 from '../assets/images/projects/nexspace/ne5.png';
import ne6 from '../assets/images/projects/nexspace/ne6.png';
import ne7 from '../assets/images/projects/nexspace/ne7.png';
import po1 from '../assets/images/projects/portfolio/po1.png';
import po2 from '../assets/images/projects/portfolio/po2.png';
import po3 from '../assets/images/projects/portfolio/po3.png';
import po4 from '../assets/images/projects/portfolio/po4.png';

const H = (title) => `[${title}]`;

const makeOutline = ({ screens = [] } = {}) => ([
  {
    key: 'overview',
    label: '개요',
    items: [
      {
        key: 'background',
        label: '기획 배경',
        type: 'rich',
        value: { intro: '', sections: [], gallery: screens },
      },

      { key: 'role', label: '담당 역할', type: 'rich', value: { intro: '', sections: [] } },
    ],
  },
  {
    key: 'implementation',
    label: '기술 설계 및 구현',
    items: [
      { key: 'stack', label: '기술 스택', type: 'rich', value: { intro: '', sections: [] } },
      { key: 'ux', label: '핵심 기능 & UX 포인트', type: 'rich', value: { intro: '', sections: [] } },
    ],
  },
  {
    key: 'retrospective',
    label: '회고',
    items: [
      { key: 'trouble', label: '문제 정의 & 해결과정', type: 'rich', value: { intro: '', sections: [] } },
      { key: 'improve', label: '아쉬운 점 & 개선 방향', type: 'rich', value: { intro: '', sections: [] } },
    ],
  },
]);

const fillOutline = (outline, patch) =>
  outline.map((group) => ({
    ...group,
    items: group.items.map((item) => {
      const next = patch?.[item.key];
      if (next === undefined) return item;

      const isObj = (v) => v && typeof v === 'object' && !Array.isArray(v);

      if (isObj(item.value) && isObj(next)) {
        return { ...item, value: { ...item.value, ...next } };
      }

      return { ...item, value: next };
    }),
  }));

export const projects = [
  {
    id: 'ez-board',
    title: 'EZ Board',
    summary: '‘Easy & Friendly’를 키워드로, 키보드 입문자를 위한 온라인 키보드 전문 쇼핑몰입니다.',
    topStacks: ['HTML5', 'CSS3', 'JavaScript', 'JSP'],
    outline: fillOutline(
      makeOutline({
        screens: [
          { src: ez2, alt: 'EZ Board 메인 화면 이미지', caption: '메인 화면' },
        ],
      }),
      {
          background: {
            intro: `
                키보드에 대한 관심이 높아지며 입문자가 느낄 수 있는 정보 부담과 진입 장벽을 ‘EZ Board’라는 이름처럼 쉽고 친근한 화면 흐름과 UI로 낮추는 것을 목표로 프로젝트를 기획했습니다.
            `,
            sections: [],
          },
        role: {
          intro: '쇼핑몰 전반의 화면을 담당하면서 상품 탐색부터 장바구니까지 이어지는 기본 구매 구조를 구축했습니다.',
          sections: [
            {
              title: '1. 화면 및 서비스 구조',
              bullets: [
                '메인, 상품 목록, 상품 상세, 장바구니 화면 UI 구현',
                '쇼핑몰 기본 레이아웃 및 페이지 구조 구성',
              ],
            },
            {
              title: '2. 쇼핑 흐름 구현',
              bullets: [
                '상품 탐색 → 상세 → 장바구니로 이어지는 기본 쇼핑 흐름 구현',
                '로그인 기반 서비스 이용 흐름 UI 구성',
              ],
            },
            {
              title: '3. UI 동작 및 인터랙션',
              bullets: [
                '버튼, 상태 변화, 화면 전환 등 사용자 인터랙션 구현',
              ],
            },
          ],
        },
        stack: {
          intro: '',
          sections: [
            {
              title: 'Frontend',
              bullets: [
                'JSP 기반 서버 사이드 렌더링 화면 구현',
                '사용자 인터랙션 중심 UI 개발',
              ],
            },
            {
              title: 'Backend',
              bullets: [
                'Spring MVC 구조 이해',
                'Java 기반 서버와의 데이터 흐름 이해',
                'MyBatis 연동 구조 경험',
              ],
            },
          ],
        },
        ux: {
          intro: '',
          sections: [
            {
              title: '핵심기능',
              bullets: [
                '상품 목록·상세·장바구니 기본 쇼핑 기능',
              ],
            },
            {
              title: 'UX 포인트',
              bullets: [
                '로그인 상태에 따라 화면 및 메뉴를 분기하여 사용자 혼란 최소화',
                '상품 정보의 우선순위를 고려한 화면 구성',
                '장바구니 화면에서 다음 행동이 자연스럽게 드러나도록 구성한 UI',
              ],
            },
          ],
        },
        trouble: {
          intro: '',
          sections: [
            {
              title: '디자인 방향 고민',
              text: `
                프로젝트 초반에는 차별화된 디자인과 익숙한 쇼핑몰 사이에서 많은 고민을 했습니다.

                그러다 EZ Board라는 이름처럼 시각적 개성보다 사용자가 흐름을 바로 이해하는 것이 더 중요하다고 판단해 익숙한 쇼핑몰 UI 패턴을 기반으로 화면 흐름과 정보 구조를 구성했습니다.

                이후 레이아웃과 비주얼 요소에 집중하던 방식에서 벗어나 각 화면이 수행해야 할 기능과 연결되는 데이터를 먼저 정리하는 방향으로 전환했습니다. 회원가입·로그인 영역에서도 UI 구현에 그치지 않고 서버 연동과 입력 흐름까지 직접 구현하며 기능 중심의 화면 설계에 집중했습니다.
              `,
            },
          ],
        },
        improve: {
          intro: '',
          sections: [
            {
              title: '1. 개발 환경 변화로 체감한 ‘웹 구조 이해’의 중요성',
              text: `
                첫 프로젝트이다 보니 STS3 환경과 서버 구조에 대한 이해가 부족한 상태에서 개발을 진행했고, 초기 세팅과 서버 연동 과정에서 많은 시행착오를 겪었습니다.

                이 경험을 통해 화면 구현뿐 아니라 요청–응답 흐름과 데이터 구조에 대한 이해가 프론트엔드 개발에도 중요하다는 것을 체감했습니다.

                이후 프로젝트에서는 기능 구현에 앞서 API 구조와 데이터 흐름을 먼저 정리한 뒤 화면을 설계하는 방식으로 접근하고 있습니다.
              `,
            },
            {
              title: '2. ‘보여주는 UI’에서 ‘데이터 기반 UX’로의 인식 전환',
              text: `
                Best3 섹션을 실제 판매 데이터가 아닌 하드코딩으로 구현했습니다. 당시에는 화면 구현에 집중했지만 이후에는 이 UI가 어떤 데이터 구조를 전제로 하는지부터 먼저 고민해야 한다는 점을 인식하게 되었습니다.
              `,
            },
          ],
        },
      }
    ),
  },

  {
    id: 'feelyeon',
    title: '필연(必然)',
    summary: '손글씨가 가진 감성과 기록의 가치를 화면 디자인으로 풀어낸 감성 문구 스토어입니다.',
    topStacks: ['HTML5', 'CSS3', 'JavaScript', 'JSP', 'Thymeleaf'],
    outline: fillOutline(
      makeOutline({
        screens: [
          { src: fe2, alt: '필연(必然) 메인 화면 이미지', caption: '메인 화면' },
          { src: fe3, alt: '필연(必然) 로그인 화면 이미지', caption: '로그인 화면' },
          { src: fe4, alt: '필연(必然) 회원가입 화면 이미지', caption: '회원가입 화면' },
        ],
      }),
      {
      background: {
        intro: `
            기존 문구 쇼핑몰 UI는 상품 정보 위주의 구성으로 손글씨와 기록이 가진 감성적 가치와 분위기를 충분히 전달하지 못한다고 느꼈습니다.

            이에 ‘손끝에서 시작된 기록의 인연’이라는 키워드를 중심으로 첫 화면부터 로그인·회원가입까지 감성 흐름이 이어지는 UI/UX 설계를 목표로 프로젝트를 기획했습니다.
        `,
        sections: [],
        },

      role: {
        intro: '메인·로그인·회원가입 화면을 담당하며 쇼핑몰 컨셉이 드러나는 레이아웃과 시각적 톤을 중심으로 UI를 담당했습니다.',
        sections: [

          {
            title: '1. 화면 UI 구현',
            bullets: [
              '메인, 로그인, 회원가입 화면 UI 구현',
              '서비스 전반 레이아웃 및 화면 구조 구성',
            ],
          },
          {
            title: '2. 화면 경험 및 감성 표현',
            bullets: [
              '서비스 컨셉에 맞춘 화면 구성',
              '첫 진입부터 가입까지 이어지는 화면 경험 설계',
              '시각적 이질감 없는 화면 전환 구성',
            ],
          },
          {
            title: '3. UX 디테일',
            bullets: [
              '서비스 전반 UI 톤 & 무드 유지',
            ],
          },
        ],
      },
      stack: {
        intro: '',
        sections: [
          {
            title: 'Frontend',
            bullets: [
              '메인 / 로그인 / 회원가입 화면 UI 개발',
              'Thymeleaf 기반 SSR 화면 구현',
              '입력 폼 UI 및 인증 화면 구성',
            ],
          },
          {
            title: 'Backend',
            bullets: [
              'Spring MVC 구조 이해',
              '로그인 / 회원가입 인증 흐름 이해',
              'Java 기반 서버와 화면 간 데이터 전달 구조 이해',
            ],
          },
        ],
      },
      ux: {
          intro: '',
          sections: [
            {
              title: '핵심기능',
              bullets: [
                '메인 / 로그인 / 회원가입 UI 구현',
                '로그인 기반 서비스 흐름 구성',
                '입력 폼 및 오류 피드백 구조 구현',
              ],
            },
            {
              title: 'UX 포인트',
              bullets: [
                '첫 화면에서 키워드가 바로 인지되도록 텍스트·여백 중심 구성',
                '정보 노출을 최소화한 단일 메시지 구조',
                '로그인·회원가입 화면에서도 메인 톤 유지',
              ],
            },
          ],
        },
        trouble: {
          intro: '',
          sections: [
            {
              title: '1. ‘감성’의 기준',
              text: `
                ‘감성적인 서비스’를 화려한 디자인이 아닌 콘텐츠에 집중하게 만드는 분위기로 정의했습니다.

                컬러, 여백, 텍스트 밀도를 절제해 시각 요소가 튀기보다 기록과 문구에 자연스럽게 시선이 머무는 화면을 만들고자 했습니다.
              `,
            },
            {
              title: '2. 로그인·회원가입 UI 고민',
              text: `
                로그인·회원가입 화면을 단순한 절차가 아닌 서비스 경험의 일부로 하여 메인 화면과 톤을 맞춰 전환 시 분위기가로그인·회원가입 화면을 서비스 경험의 시작 지점으로 보고 메인 화면과 톤·레이아웃 흐름을 맞춰 화면 전환 시 분위기가 끊기지 않도록 설계했습니다. 끊기지 않도록 구성했습니다.
              `,
            },
            {
              title: '3. 화면을 그리는 순서',
              text: `
                사용자의 읽는 흐름과 행동 순서를 기준으로 정보 구조와 인터랙션 밀도를 조절하며 화면을 구성했습니다.
              `,
            },
          ],
        },
        improve: {
          intro: '',
          sections: [
            {
              title: '1. 속도에 치우친 개발 과정',
              text: `
                프로젝트가 비교적 짧은 일정으로 진행되면서 기능 구조나 서버 연동을 충분히 확장하기보다는 화면 완성과 분위기 구현에만 집중하다보니 서비스 구조 전반을 깊게 다루는 데에는 한계가 있었습니다.
              `,
            },
            {
              title: '2. 협업 관점에서의 아쉬움',
              text: `
                각 팀이 제한된 시간 안에 결과물을 만들어야 했기 때문에 디자인 완성도에 대한 논의가 주가 되었고 기능 설계나 데이터 흐름에 대한 충분한 합의 과정을 거치지 못했습니다.

                짧은 일정 속에서 작업하며 프로젝트 초반에 역할 분담과 개발 범위, 우선순위를 명확히 설정하는 과정이 결과물의 방향에 큰 영향을 준다는 점을 확실히 알게 되었습니다.
              `,
            },
          ],
        },
      }
    ),
  },

  {
    id: 'withme',
    title: 'withme',
    summary: '문진 데이터를 중심으로 반려견의 건강 정보를 관리할 수 있는 반려견 헬스케어 웹 서비스입니다.',
    topStacks: ['HTML5', 'CSS3', 'JavaScript', 'React', 'Vite'],
    outline: fillOutline(
      makeOutline({
        screens: [
          { src: wi2, alt: '위드미 메인 화면 이미지', caption: '메인 화면' },
          { src: wi3, alt: '위드미 로그인 로그인 화면 이미지', caption: '로그인 화면' },
          { src: wi4, alt: '위드미 쇼핑몰 화면 이미지', caption: '쇼핑몰 화면' },
          { src: wi5, alt: '위드미 장바구니 화면 이미지', caption: '장바구니 화면' },
          { src: wi6, alt: '위드미 관리자 화면 이미지', caption: '관리자 화면' },
        ],
      }),
      {
      background: {
        intro: `
            기존 반려동물 서비스는 기능이 여러 플랫폼에 분산되어 있어 반려견의 상태를 통합적으로 관리하기 어렵고, 보호자는 명확한 기준 없이 경험에 의존해 선택해야 하는 구조였습니다. 반려견의 상태를 한 흐름 안에서 기록하고 관리할 수 있는 서비스의 필요성을 느껴 문진 데이터를 중심으로 반려견의 상태를 기록·관리하는 하나의 서비스 구조를 가진 위드미(withme)를 기획하게 되었습니다.
        `,
        sections: [],
        },
      role: {
        intro: '메인·쇼핑·관리자 화면까지 서비스 전반 UI를 맡아 주요 화면 구성과 기능 UI를 담당했습니다.',
        sections: [

          {
            title: '1. 화면 및 서비스 UI',
            bullets: [
              '메인 페이지 UI 및 전체 레이아웃 구성',
            ],
          },
          {
            title: '2. 로그인·회원가입 및 접근 흐름',
            bullets: [
              '일반 사용자 / 수의사 로그인·회원가입 화면 UI 구현',
              '로그인 기반 화면 접근 흐름 구성',
            ],
          },
          {
            title: '3. 쇼핑 기능 UI',
            bullets: [
              '상품 목록·상세 페이지 UI',
              '장바구니 기능 UI 및 상태 관리',
            ],
          },
          {
            title: '4. 관리자 페이지',
            bullets: [
              '관리자 전용 대시보드 화면 구성',
              '서비스 관리 기능을 고려한 UI 구조 설계',
            ],
          },
        ],
      },
      stack: {
        intro: '',
        sections: [
          {
            title: 'Frontend',
            bullets: [
              'React, Vite 기반 SPA 환경 구축',
              '메인·쇼핑·관리자 화면 UI 개발',
              '로그인·회원가입 화면 구현',
              '상품 목록·상세·장바구니 UI 개발',
              'REST API 연동 및 상태 관리',
            ],
          },
          {
            title: 'Backend',
            bullets: [
              'Spring Boot 기반 REST API 구조 이해',
              '로그인·회원가입 및 사용자 유형 분리 구조 이해',
              '프론트엔드 관점에서의 API 연동 및 데이터 처리 경험',
              '서버와의 역할 분리를 고려한 화면 구성',
            ],
          },
        ],
      },
      ux: {
          intro: '',
          sections: [
            {
              title: '핵심기능',
              bullets: [
                '사용자 유형 분리 로그인 · 회원 시스템',
                '메인 페이지 UI',
                '쇼핑몰 및 장바구니 기능',
                '관리자 페이지 대시보드',
              ],
            },
            {
              title: 'UX 포인트',
              bullets: [
                '로그인·회원가입 화면에서 사용자 유형을 구분하는 진입 구조',
                '쇼핑몰 중심 서비스 구조에 맞춘 메인 화면 구성',
                '관리자 관점에서 정보를 확인할 수 있는 대시보드 UI',
                '문진 중심 서비스 성격이 드러나는 초기 화면 구성',
              ],
            },
          ],
        },
        trouble: {
          intro: '',
          sections: [
            {
              title: '1. 기능 정의에 대한 합의 부족',
              text: `
                ‘알레르기 기반 상품 필터링’ 기능에서 팀 내 기능 정의가 명확히 맞춰지지 않아 구현 과정에서 의도와 다른 방향으로 개발이 진행되면서 코드 충돌로 기능을 롤백하게 되었고, 구현 이전 단계에서 요구사항과 동작 기준을 구체적으로 합의하는 과정의 중요성을 체감했습니다.
              `,
            },
            {
              title: '2. 스타일 관리 기준의 부재',
              text: `
                공통 CSS 규칙이 정리되지 않은 상태에서 협업을 진행하며 버튼 등 UI 요소의 크기와 색상이 예기치 않게 변경되는 문제가 발생했습니다. 이미 구현된 화면 전반을 수정해야 했고, 이를 통해 스타일 구조와 관리 기준을 사전에 설계하는 것의 필요성을 느꼈습니다.
              `,
            },
          ],
        },
        improve: {
          intro: '',
          sections: [
            {
              title: '1. 속도에 치우친 개발 과정',
              text: `
                프로젝트가 비교적 짧은 일정으로 진행되면서 기능 구조나 서버 연동을 충분히 확장하기보다는 화면 완성과 분위기 구현에만 집중하다보니 서비스 구조 전반을 깊게 다루는 데에는 한계가 있었습니다.
              `,
            },
            {
              title: '2. 협업 관점에서의 아쉬움',
              text: `
                각 팀이 제한된 시간 안에 결과물을 만들어야 했기 때문에 디자인 완성도에 대한 논의가 주가 되었고 기능 설계나 데이터 흐름에 대한 충분한 합의 과정을 거치지 못했습니다.

                짧은 일정 속에서 작업하며 프로젝트 초반에 역할 분담과 개발 범위, 우선순위를 명확히 설정하는 과정이 결과물의 방향에 큰 영향을 준다는 점을 확실히 알게 되었습니다.
              `,
            },
          ],
        },
      }
    ),
  },

  {
    id: 'nexspace',
    title: 'Nexspace ERP',
    summary: '사내 구매 요청부터 결재, 입찰, 계약, 발주, 정산까지의 전 과정을 하나의 시스템으로 관리하는 통합 구매 관리 시스템입니다.',
    topStacks: ['HTML5', 'CSS3', 'JavaScript', 'React', 'Vite', 'Redux'],
    outline: fillOutline(
      makeOutline({
        screens: [
          { src: ne2, alt: 'Nexspace 메인 화면 이미지', caption: '메인 화면' },
          { src: ne3, alt: 'Nexspace 업무 포털 화면 이미지', caption: '업무 포털 화면' },
          { src: ne4, alt: 'Nexspace 결재 결재 대시보드 화면 이미지', caption: '결재 대시보드 화면' },
          { src: ne5, alt: 'Nexspace 전체 구매 요청 목록 화면 이미지', caption: '전체 구매 요청 목록 화면' },
          { src: ne6, alt: 'Nexspace 결재 요청 상세 화면 이미지', caption: '결재 요청 상세 화면' },
          { src: ne7, alt: 'Nexspace 결재선 관리 화면 이미지', caption: '결재선 관리 화면' },
        ],
      }),
      {
      background: {
        intro: `
            이 프로젝트는 복잡한 구매·결제 프로세스 속에서 사용자가 자신의 현재 위치와 다음 행동을 직관적으로 파악하기 어렵다는 문제의식에서 출발했습니다. 구매 과정이 길고 참여자가 많아 진행 상황을 한눈에 이해하기 어려웠고, 기존 시스템 역시 사용성 측면에서 한계를 가지고 있었습니다. 이를 해결하기 위해 복잡한 프로세스 자체가 화면 구조로 드러나도록 설계하는 것을 핵심 기획 방향으로 설정했습니다.
        `,
        sections: [],
        },
      role: {
        intro: '전체 UI 구조와 공통 레이아웃을 설계하고 기안·결재의 프론트엔드와 백엔드를 구현했습니다.',
        sections: [

          {
            title: '1. 공통 UI 구조 및 Layout',
            bullets: [
              '전체 서비스 공통 Layout 및 네비게이션 구조 설계',
              '팀 공통 화면 틀 구축 및 포털형 UI 구조 구성',
            ],
          },
          {
            title: '2. 핵심 기능 구현 (Frontend)',
            bullets: [
              '메인 페이지, 포털 UI, 협력회사 등록 화면 구현',
              '기안·결재 프로세스 프론트엔드 UI 및 화면 흐름 구현',
            ],
          },
          {
            title: '3. 기안·결재 프로세스 구현 (Backend)',
            bullets: [
              '기안·결재 기능 서버 로직 구현',
              '단계별 승인 흐름 및 데이터 처리 구조 구축',
            ],
          },
          {
            title: '4. UX 개선 요소 도입',
            bullets: [
              'breadcrumb 도입으로 현재 위치·단계 인식 UX 개선',
            ],
          },
        ],
      },
      stack: {
        intro: '',
        sections: [
          {
            title: 'Frontend',
            bullets: [
              'React, Vite 기반 SPA 환경 구축',
              'Redux 기반 전역 상태 관리',
              '포털형 라우팅 및 공통 Layout 구조',
              'breadcrumb 기반 네비게이션',
              'REST API 연동 및 상태 관리',
            ],
          },
          {
            title: 'Backend',
            bullets: [
              'Spring Boot 기반 REST API 구조 이해',
              '로그인·회원가입 및 사용자 유형 분리 구조 이해',
              '프론트엔드 관점에서의 API 연동 및 데이터 처리 경험',
              '서버와의 역할 분리를 고려한 화면 구성',
            ],
          },
        ],
      },
      ux: {
          intro: '',
          sections: [
            {
              title: '핵심기능',
              bullets: [
                '전사 포털 및 공통 Layout 구조',
                '기안·결재 프로세스 UI',
                '협력회사 등록 시스템',
                'breadcrumb 기반 네비게이션',
                '다중 권한 기반 화면 구조',
              ],
            },
            {
              title: 'UX 포인트',
              bullets: [
                '결재 단계와 현재 위치가 드러나는 화면 구성',
                '포털 구조를 통한 기능 접근 방식',
                '내부 사용자·협력사 화면 분리',
                '복잡한 프로세스를 단계적으로 보여주는 UI',
              ],
            },
          ],
        },
        trouble: {
          intro: '',
          sections: [
            {
              title: '1. ‘기능 페이지 모음’에서 ‘업무 흐름의 시작점’으로',
              text: `
                기존 프로젝트의 구조는 메인에서 각 기능 페이지로 바로 이동하는 방식이라 서비스 전체 흐름을 한눈에 파악하기 어려웠습니다. 로그인 후 자신의 업무 상태를 먼저 확인하고 다음 행동으로 이어질 수 있는 화면이 필요하다고 판단했고, 실제 사내 시스템처럼 ‘포털’ 개념의 페이지를 기획했습니다.
              `,
            },
            {
              title: '2. 나의 업무 현황을 중심으로 한 포털 설계',
              text: `
                포털을 단순한 메뉴 모음이 아니라 ‘내 업무를 한 번에 확인하는 공간’으로 만들고자 했습니다. 나의 업무 현황, 결재 상태, 신규 구매요청, 게시판, 캘린더 등을 배치해 사용자가 현재 상황을 빠르게 파악할 수 있도록 구성했고, 제가 맡았던 결재 파트와 연동해 실제 결재·구매요청 데이터를 포털에서 바로 확인할 수 있도록 구현했습니다.
              `,
            },
          ],
        },
        improve: {
          intro: '',
          sections: [
            {
              title: '1. 포털 전반의 데이터 연동 한계',
              text: `
                포털을 프로젝트 후반부에 제작하다 보니 결재 섹션을 제외한 대부분의 영역은 실제 데이터를 연동하지 못하고 하드코딩을 하면서 전체 포털을 데이터 기반으로 완성하지 못해 화면과 기능 간의 연결성이 충분히 살아나지 못했습니다.
              `,
            },
            {
              title: '2. 확장하지 못한 포털 기능',
              text: `
                포털이라는 성격에 맞게 다양한 관리 기능과 위젯 요소들을 추가하고 싶었지만 일정상 기본 구조를 구축하는 데에 그쳤습니다. 포털을 프로젝트의 중심 화면으로 발전시키기에는 기능 확장과 고도화가 충분하지 못했습니다.

                추후 포털을 중심으로 각 기능의 데이터를 통합하고, 사용자 역할에 따라 다른 정보가 보이는 구조로 확장해보고 싶습니다.
              `,
            },
          ],
        },
      }
    ),
  },
  {
    id: 'portfolio',
    title: 'Pages by Seoyun',
    summary: '프론트엔드 개발자로서의 방향성과 고민을 담아낸 개인 포트폴리오 웹사이트입니다.',
    topStacks: ['HTML5', 'CSS3', 'JavaScript', 'React', 'Vite'],
    outline: fillOutline(
      makeOutline({
        screens: [
          { src: po1, alt: '개인 포트폴리오 인트로 화면', caption: '인트로 화면' },
          { src: po2, alt: '개인 포트폴리오 프로필 화면', caption: '프로필 화면' },
          { src: po3, alt: '개인 포트폴리오 프로젝트 소개 화면', caption: '프로젝트 소개 화면' },
          { src: po4, alt: '개인 포트폴리오 아웃트로 화면', caption: '아웃트로 화면' },
        ],
      }),
      {
      background: {
        intro: `
            이 포트폴리오 프로젝트는 단순한 결과물 정리가 아니라 프론트엔드 개발자로서 화면을 어떻게 설계하는지를 보여주는 것을 목표로 기획했습니다.

            구현에 앞서 사용자 흐름, 정보 구조, 인터랙션의 역할을 먼저 정의하여 방문자가 사이트를 따라오며 개발자의 관점이 드러나는 구성을 설계했습니다.
        `,
        sections: [],
        },
      role: {
        intro: '포트폴리오 전체 기획부터 화면 설계 및 인터랙션 구현까지 서비스 전반을 구축했습니다.',
        sections: '',
      },
      stack: {
        intro: '',
        sections: [
          {
            title: 'Frontend',
            bullets: [
              'React, Vite 기반 SPA',
              '섹션 단위 컴포넌트 구조 및 공통 레이아웃',
              '스크롤 기반 화면 전환 및 상태 관리',
              '모달 UI 및 인터랙션 구조 구현',
              'Intersection Observer 기반 스크롤 이벤트 처리',
              'CSS 애니메이션 및 트랜지션 구현'
            ],
          },
        ],
      },
      ux: {
        intro: null,
        sections: null,
      },
        trouble: {
          intro: '',
          sections: [
            {
              title: '1. 첫 화면 설계',
              text: `
                포트폴리오는 첫 인상에서 흥미를 주지 못하면 끝까지 보지 않을 수 있다고 판단해 가장 먼저 첫 화면 설계부터 고민했습니다. 눈에 띄되 과하지 않고, 프론트엔드 개발자로서의 감각과 ‘나다움’이 드러나는 화면을 목표로 레이아웃, 여백, 타이포, 인터랙션 강도를 반복적으로 조정하면서 시선을 끌면서도 부담스럽지 않은 첫 진입 경험을 구현하는 데 집중했습니다.
              `,
            },
            {
              title: '2. 프로젝트 섹션 기획',
              text: `
                두 번째 고민은 프로젝트를 어떻게 보여줄 것인가였습니다. 단순 나열 방식이 아닌 콘텐츠를 ‘탐색하는’ 경험을 만들고 싶었습니다.

                넷플릭스 UI에서 착안해 여러 프로젝트를 직관적으로 둘러볼 수 있는 카드 기반 구조를 고안했고, 페이지 이동 대신 모달 + 내부 내비게이션 구조를 적용해 많은 정보를 빠르게 탐색할 수 있도록 구성했습니다.
              `,
            },
          ],
        },
        improve: {
          intro: '',
          sections: [
            {
              title: '반응형 대응의 한계',
              text: `
                이번 포트폴리오는 데스크톱 환경을 중심으로 설계·구현해, 다양한 해상도와 모바일 환경까지 충분히 고려하지 못했습니다. 모바일·태블릿 환경을 기준으로 레이아웃을 다시 설계하고, Grid와 Flex 기반의 반응형 구조를 정리해 해상도에 따라 콘텐츠 밀도와 인터랙션을 조정하는 방향으로 보완해 나가고자 합니다.
              `,
            },
          ],
        },
      }
    ),
  },
];
