"""
고등학교 3개년 영어과 문법 로드맵 데이터
의령여자고등학교 고등학교 3개년 교과서 수록 순서 기준
"""

NOTICE_MESSAGE = "본 로드맵은 교과서 문법 파트(Structures / Grammar in Reading)에 수록된 순서대로 정리되었으며 실제 수업 진도와는 차이가 있을 수 있습니다."

GRAMMAR_ROADMAP_DATA = [
    {
        "id": "eng_common_1",
        "grade": "1학년",
        "semester": "1학기",
        "curriculum_type": "공통 과목",
        "subject": "공통영어1",
        "publisher": "미래엔 (김선영)",
        "summary": "고교 영어의 기본기를 다지는 단계로, 복문 구조를 이끄는 관계대명사와 문장의 간결성을 높이는 분사구문, 가정법 및 도치 등 핵심 통사 구조를 습득합니다.",
        "units": [
            {
                "unit_number": 1,
                "unit_title": "You and I Become “We”",
                "theme": "대인관계와 진정한 소통",
                "points": [
                    {
                        "point_num": 1,
                        "title": "관계대명사의 역할과 생략 (주격 / 목적격)",
                        "tag": "관계사",
                        "page": 26,
                        "image_path": "pages_cache/1학년_1학기_공통영어1_미래엔_p26.jpg",
                        "key_sentence": "The athlete who broke the world record has inspired other players. / Media literacy is the ability to critically assess perspectives in the news (which) we encounter.",
                        "explanation": "선행사가 사람인지 사물인지에 따라 who, which, that을 선택하며, 목적격 관계대명사는 단독 생략 가능함을 학습합니다."
                    },
                    {
                        "point_num": 2,
                        "title": "분사구문 (현재분사 / 과거분사)",
                        "tag": "분사",
                        "page": 27,
                        "image_path": "pages_cache/1학년_1학기_공통영어1_미래엔_p27.jpg",
                        "key_sentence": "Powered by electricity, this car produces fewer pollutants than a gasoline-fueled one. / (When) Paired with new partners, the chimpanzees usually failed to get the food.",
                        "explanation": "접속사와 주어를 생략하고 동사를 분사(V-ing / p.p.)로 전환하여 시간, 이유, 조건 등의 부대상황을 간결하고 세련되게 나타냅니다."
                    }
                ]
            },
            {
                "unit_number": 2,
                "unit_title": "Open a Book, Open the World",
                "theme": "문학을 통한 삶의 지혜와 공감",
                "points": [
                    {
                        "point_num": 1,
                        "title": "as if 가정법 (마치 ~인 것처럼)",
                        "tag": "가정법",
                        "page": 48,
                        "image_path": "pages_cache/1학년_1학기_공통영어1_미래엔_p48.jpg",
                        "key_sentence": "He even starts to think as if he were a dog. / Eric looks as if he owned the whole world these days.",
                        "explanation": "현재 사실과 반대되거나 실현 가능성이 희박한 상황을 표현할 때 'as if + 주어 + 과거동사/were'를 사용하여 표현합니다."
                    },
                    {
                        "point_num": 2,
                        "title": "how + 형용사/부사 + 주어 + 동사",
                        "tag": "간접의문문",
                        "page": 48,
                        "image_path": "pages_cache/1학년_1학기_공통영어1_미래엔_p48.jpg",
                        "key_sentence": "He is surprised at how easily it is to pretend to be something else.",
                        "explanation": "how 뒤에 수식하는 형용사나 부사가 결합하여 정도를 강조하며, 명사절로서 전치사의 목적어나 보어 역할을 수행합니다."
                    }
                ]
            },
            {
                "unit_number": 3,
                "unit_title": "Free Yourself with Science",
                "theme": "과학적 원리와 발견",
                "points": [
                    {
                        "point_num": 1,
                        "title": "부정어구 및 장소부사구 도치",
                        "tag": "특수구문",
                        "page": 70,
                        "image_path": "pages_cache/1학년_1학기_공통영어1_미래엔_p70.jpg",
                        "key_sentence": "Never did she dream of becoming the world’s most popular movie star. / At the top of the mountain were a couple of climbers.",
                        "explanation": "Never, Rarely, Seldom 등 부정어구나 장소 부사구가 문두에 위치할 때 '조동사/be동사 + 주어 + 본동사' 어순으로 도치됩니다."
                    },
                    {
                        "point_num": 2,
                        "title": "가주어 It ~ 의미상 주어 for ~ 진주어 to부정사",
                        "tag": "to부정사",
                        "page": 71,
                        "image_path": "pages_cache/1학년_1학기_공통영어1_미래엔_p71.jpg",
                        "key_sentence": "It is very important for children to get enough sleep for their growth. / It is pleasant for students to share their favorite activities.",
                        "explanation": "길어진 to부정사 주어를 대신하여 가주어 It을 문두에 세우고, to부정사의 행위 주체를 'for + 목적격'으로 밝혀줍니다."
                    }
                ]
            },
            {
                "unit_number": 4,
                "unit_title": "Let It Be Green",
                "theme": "지속 가능한 환경과 생태계",
                "points": [
                    {
                        "point_num": 1,
                        "title": "with + 명사 + 분사 (부대상황 동시동작)",
                        "tag": "분사",
                        "page": 92,
                        "image_path": "pages_cache/1학년_1학기_공통영어1_미래엔_p92.jpg",
                        "key_sentence": "On Sports Day, I ran as fast as I could, with all my classmates encouraging me. / Judy walked out of the library with her backpack filled with books.",
                        "explanation": "명사와 분사의 관계가 능동이면 현재분사(~ing), 수동이면 과거분사(p.p.)를 사용하여 '~한 채로, ~하면서'의 상황을 묘사합니다."
                    },
                    {
                        "point_num": 2,
                        "title": "상관접속사와 병렬 구조 (neither A nor B / not A but B)",
                        "tag": "접속사",
                        "page": 93,
                        "image_path": "pages_cache/1학년_1학기_공통영어1_미래엔_p93.jpg",
                        "key_sentence": "They could find their cat neither in the living room nor in the kitchen. / What truly matters in life is not others’ opinion but your own perspective.",
                        "explanation": "두 개의 어구(A, B)를 짝지어 연결하며, A와 B는 문법적으로 동등한 품사나 구 형태(병렬 구조)를 유지해야 합니다."
                    }
                ]
            }
        ]
    },
    {
        "id": "eng_common_2",
        "grade": "1학년",
        "semester": "2학기",
        "curriculum_type": "공통 과목",
        "subject": "공통영어2",
        "publisher": "미래엔 (김선영)",
        "summary": "5형식 문형의 심화, 과거완료 및 조동사 완료형, 당위성 that절, 가목적어-진목적어 등 고교 필수 복합 구문을 완성합니다.",
        "units": [
            {
                "unit_number": 1,
                "unit_title": "We Share, We Care",
                "theme": "나눔과 공동체적 연대",
                "points": [
                    {
                        "point_num": 1,
                        "title": "5형식 목적격 보어로 to부정사를 취하는 동사",
                        "tag": "5형식",
                        "page": 26,
                        "image_path": "pages_cache/1학년_2학기_공통영어2_미래엔_p26.jpg",
                        "key_sentence": "His friends encouraged him to attend the music festival. / Our teacher advised us not to compare ourselves with others.",
                        "explanation": "encourage, advise, ask, allow, expect 등 타인의 행동을 권유·지도하는 동사 뒤에 '목적어 + to부정사'가 이어지는 핵심 5형식 구문입니다."
                    },
                    {
                        "point_num": 2,
                        "title": "과거완료 시제 (had + p.p.)",
                        "tag": "시제",
                        "page": 27,
                        "image_path": "pages_cache/1학년_2학기_공통영어2_미래엔_p27.jpg",
                        "key_sentence": "My dad had already prepared lunch when I arrived home. / Ferdi had never seen snow before he moved to Korea.",
                        "explanation": "과거의 특정 시점 이전에 먼저 발생한 사건(대과거)이나 과거 기준점까지의 완료·경험을 정확하게 표현합니다."
                    }
                ]
            },
            {
                "unit_number": 2,
                "unit_title": "Be a Wise Consumer",
                "theme": "합리적 소비와 글로벌 마케팅",
                "points": [
                    {
                        "point_num": 1,
                        "title": "조동사 + have p.p. (과거 추측과 후회)",
                        "tag": "조동사",
                        "page": 48,
                        "image_path": "pages_cache/1학년_2학기_공통영어2_미래엔_p48.jpg",
                        "key_sentence": "The company must have been sure of success. / The company should have asked Maori translators to check the phrase in advance.",
                        "explanation": "must have p.p.(~했음에 틀림없다), should have p.p.(~했어야 했는데 하지 않았다), could have p.p.(~할 수도 있었을 텐데)의 의미 차이를 구별합니다."
                    },
                    {
                        "point_num": 2,
                        "title": "주장·제안·요구 동사 뒤 that절의 (should) + 동사원형",
                        "tag": "특수구문",
                        "page": 49,
                        "image_path": "pages_cache/1학년_2학기_공통영어2_미래엔_p49.jpg",
                        "key_sentence": "The doctor suggested that the patient (should) exercise for at least 30 minutes every day. / Marketing experts suggest that companies exercise caution.",
                        "explanation": "suggest, insist, demand, recommend 등의 당위성을 나타내는 동사 뒤 that절에서 should가 생략되어 동사원형이 쓰이는 문법입니다."
                    }
                ]
            },
            {
                "unit_number": 3,
                "unit_title": "The True Art Lovers",
                "theme": "예술 작품과 미적 감수성",
                "points": [
                    {
                        "point_num": 1,
                        "title": "접속사 vs 전치사 구분 (because vs because of / while vs during)",
                        "tag": "접속사",
                        "page": 70,
                        "image_path": "pages_cache/1학년_2학기_공통영어2_미래엔_p70.jpg",
                        "key_sentence": "Because the weather was bad, they had to call off ... (= Because of the bad weather, ~) / While we were on our trip, ... (= During our trip, ~)",
                        "explanation": "접속사 뒤에는 절(주어+동사)이 오고, 전치사 뒤에는 명사(구)가 오는 통사적 구별 능력을 기릅니다."
                    },
                    {
                        "point_num": 2,
                        "title": "관계대명사의 계속적 용법 (, which)",
                        "tag": "관계사",
                        "page": 71,
                        "image_path": "pages_cache/1학년_2학기_공통영어2_미래엔_p71.jpg",
                        "key_sentence": "Sarah hosted a personal gallery with her photographs, which was her childhood dream.",
                        "explanation": "콤마(,) 뒤에 관계대명사를 써서 선행사나 앞 문장 전체 내용에 대한 부가 정보를 덧붙이며, that이나 what은 사용할 수 없습니다."
                    }
                ]
            },
            {
                "unit_number": 4,
                "unit_title": "Sink or Swim in the Digital Ocean",
                "theme": "디지털 리터러시와 AI 기술",
                "points": [
                    {
                        "point_num": 1,
                        "title": "가목적어-진목적어 구문 (find / consider / make it ... to-v)",
                        "tag": "5형식",
                        "page": 92,
                        "image_path": "pages_cache/1학년_2학기_공통영어2_미래엔_p92.jpg",
                        "key_sentence": "Our team members consider it important to arrive on time for meetings. / When I have to give presentations, I find it difficult to manage public speaking anxiety.",
                        "explanation": "목적어가 긴 to부정사나 that절일 때 가목적어 it을 목적어 자리에 두고, 진목적어를 문장 뒤로 보내어 명확한 문장을 만듭니다."
                    },
                    {
                        "point_num": 2,
                        "title": "동격의 접속사 that",
                        "tag": "명사절",
                        "page": 93,
                        "image_path": "pages_cache/1학년_2학기_공통영어2_미래엔_p93.jpg",
                        "key_sentence": "I agree with the opinion that we should have a flea market this Friday. / The belief is widely accepted that honesty is the best policy.",
                        "explanation": "the opinion, the fact, the belief 등 추상명사 뒤에 완전한 문장이 이어져 명사의 구체적 내용을 풀어서 설명합니다."
                    }
                ]
            }
        ]
    },
    {
        "id": "eng_1",
        "grade": "2학년",
        "semester": "1학기",
        "curriculum_type": "일반선택 과목",
        "subject": "영어Ⅰ",
        "publisher": "엔이능률 (오선영)",
        "summary": "수능 및 학술 영어 독해의 디딤돌 과목으로, 시간·조건 부사절 시제 일치, 준사역동사, 간접화법, 대동사 do so 등 표현의 정밀도를 높이는 문법을 다룹니다.",
        "units": [
            {
                "unit_number": 1,
                "unit_title": "Journey to the Future",
                "theme": "미래 기술과 인간의 삶",
                "points": [
                    {
                        "point_num": 1,
                        "title": "to부정사를 목적격 보어로 취하는 동사 (advise / expect / allow)",
                        "tag": "5형식",
                        "page": 25,
                        "image_path": "pages_cache/2학년_1학기_영어Ⅰ_엔이능률_p25.jpg",
                        "key_sentence": "We advise you to be aware that construction work is scheduled. / She asked me to play badminton with her after breakfast.",
                        "explanation": "주어의 요청이나 기대를 전달하는 5형식 동사 표현으로, 독해 및 작문에서 가장 빈번하게 활용되는 핵심 패턴입니다."
                    },
                    {
                        "point_num": 2,
                        "title": "so ~ that ... 구문 (결과의 부사절)",
                        "tag": "부사절",
                        "page": 25,
                        "image_path": "pages_cache/2학년_1학기_영어Ⅰ_엔이능률_p25.jpg",
                        "key_sentence": "It was so realistic that I felt like I was actually driving a car! / The VR game café was so entertaining that we decided to go there again.",
                        "explanation": "'매우 ~해서 그 결과 ...하다'의 의미로 원인과 결과를 강하게 연결하는 기본 복문 구조입니다."
                    }
                ]
            },
            {
                "unit_number": 2,
                "unit_title": "The Power of Good Habits",
                "theme": "습관의 심리학과 생태 보호",
                "points": [
                    {
                        "point_num": 1,
                        "title": "조건 부사절의 시제 (현재시제가 미래 대용)",
                        "tag": "시제",
                        "page": 51,
                        "image_path": "pages_cache/2학년_1학기_영어Ⅰ_엔이능률_p51.jpg",
                        "key_sentence": "If you drive, you will need to be extra careful since the roads will be wet. / If you leave earlier, you will be able to avoid the traffic.",
                        "explanation": "시간 및 조건 부사절(if, when, unless 등) 내부에서는 미래 시제 will 대신 현재 시제를 사용하는 문법 규칙을 익힙니다."
                    },
                    {
                        "point_num": 2,
                        "title": "전치사 + 동명사의 관용적 명사 수식 (of ~ing)",
                        "tag": "동명사",
                        "page": 51,
                        "image_path": "pages_cache/2학년_1학기_영어Ⅰ_엔이능률_p51.jpg",
                        "key_sentence": "many plant and animal species are in danger of becoming extinct. / Join us to fulfill the dream of protecting all living things on earth!",
                        "explanation": "the danger of ~ing, the idea of ~ing, the possibility of ~ing 등 명사 뒤에서 전치사 of와 동명사가 결합해 구체적 내용을 서술합니다."
                    }
                ]
            },
            {
                "unit_number": 3,
                "unit_title": "Let’s Live in Harmony",
                "theme": "다양성 존중과 공동체 조화",
                "points": [
                    {
                        "point_num": 1,
                        "title": "의문사 + to부정사 (명사구 역할)",
                        "tag": "to부정사",
                        "page": 77,
                        "image_path": "pages_cache/2학년_1학기_영어Ⅰ_엔이능률_p77.jpg",
                        "key_sentence": "I don’t know what to do, as it makes too much noise. / I have no idea how to recover it. Please let me know where to get it fixed.",
                        "explanation": "what to do(= what I should do), how to recover(= how I should recover)처럼 절을 간결한 to부정사 명사구로 압축하는 표현입니다."
                    },
                    {
                        "point_num": 2,
                        "title": "관계대명사 who / that의 수식절",
                        "tag": "관계사",
                        "page": 77,
                        "image_path": "pages_cache/2학년_1학기_영어Ⅰ_엔이능률_p77.jpg",
                        "key_sentence": "It tells the story of a teenage girl who is overweight. / I recommend this book to anyone who enjoys reading humorous and moving stories.",
                        "explanation": "선행사의 속성을 한정적으로 수식하며 복합 문장을 구성하는 핵심 관계사절을 다룹니다."
                    }
                ]
            },
            {
                "unit_number": 4,
                "unit_title": "Spark Your Creativity",
                "theme": "창의적 사고와 발상의 전환",
                "points": [
                    {
                        "point_num": 1,
                        "title": "접속사가 생략되지 않은 분사구문 (when asked / if given)",
                        "tag": "분사",
                        "page": 103,
                        "image_path": "pages_cache/2학년_1학기_영어Ⅰ_엔이능률_p103.jpg",
                        "key_sentence": "cooperate with our flight attendants when asked to do something. / If given the chance, would you live abroad?",
                        "explanation": "분사구문에서 시간이나 조건의 의미를 명확하게 전달하기 위해 접속사(when, if, while)를 생략하지 않고 분사 앞에 남겨두는 구조입니다."
                    },
                    {
                        "point_num": 2,
                        "title": "대동사 구문 (do so / doing so)",
                        "tag": "특수구문",
                        "page": 103,
                        "image_path": "pages_cache/2학년_1학기_영어Ⅰ_엔이능률_p103.jpg",
                        "key_sentence": "Rest your forehead on the floor and relax. Doing so will relieve any back pain. / Pressing your standing foot firmly will help you do so.",
                        "explanation": "앞서 언급된 동사구의 반복을 피하고 글의 응집성을 높이기 위해 'do so / doing so'를 대동사로 활용합니다."
                    }
                ]
            },
            {
                "unit_number": 5,
                "unit_title": "Rise Above Challenges",
                "theme": "위기 극복과 회복 탄력성",
                "points": [
                    {
                        "point_num": 1,
                        "title": "준사역동사 help + 목적어 + (to) 동사원형",
                        "tag": "5형식",
                        "page": 129,
                        "image_path": "pages_cache/2학년_1학기_영어Ⅰ_엔이능률_p129.jpg",
                        "key_sentence": "This brand-new product will help your clothes regain their original brightness. / special ingredients that help clothes smell fresh",
                        "explanation": "동사 help는 목적격 보어로 to부정사와 원형부정사를 모두 취할 수 있는 유연한 구조를 지닙니다."
                    },
                    {
                        "point_num": 2,
                        "title": "간접화법 전환 및 ask if / whether ~",
                        "tag": "간접화법",
                        "page": 129,
                        "image_path": "pages_cache/2학년_1학기_영어Ⅰ_엔이능률_p129.jpg",
                        "key_sentence": "as soon as I got back to the store, he remembered me and asked if I had left something behind. / I told him I had forgotten my phone and asked if he had seen it.",
                        "explanation": "의문사가 없는 의문문을 전달할 때 'ask + if/whether + 주어 + 동사' 어순과 시제 일치(과거완료)를 적용하는 간접화법입니다."
                    }
                ]
            }
        ]
    },
    {
        "id": "eng_reading_writing",
        "grade": "2학년",
        "semester": "2학기",
        "curriculum_type": "일반선택 과목",
        "subject": "영어 독해와 작문",
        "publisher": "미래엔 (김대진)",
        "summary": "긴 호흡의 학술 지문 독해와 영작문(Writing)에 직접 연결되는 심화 통사 구조를 훈련합니다. 현재완료 수동태, 후치 수식 분사, It is ~ that 강조구문, whether/if 명사절을 체계화합니다.",
        "units": [
            {
                "unit_number": 1,
                "unit_title": "Overcoming Obstacles",
                "theme": "한계 극복과 사회적 용기",
                "points": [
                    {
                        "point_num": 1,
                        "title": "원인·권유 5형식 동사 (encourage / cause / allow + O + to-v)",
                        "tag": "5형식",
                        "page": 26,
                        "image_path": "pages_cache/2학년_2학기_영어독해와작문_미래엔_p26.jpg",
                        "key_sentence": "her mother encouraged her to f ight for her dream. / The professor allowed Alan to leave early. / Prime Minister's health caused him to resign.",
                        "explanation": "목적어가 어떤 행동을 하도록 유도하거나 유발하는 다양한 5형식 동사의 목적격 보어 to-v 결합 원리를 익힙니다."
                    },
                    {
                        "point_num": 2,
                        "title": "양보와 조건의 부사절 접속사 (even though, unless)",
                        "tag": "부사절",
                        "page": 26,
                        "image_path": "pages_cache/2학년_2학기_영어독해와작문_미래엔_p26.jpg",
                        "key_sentence": "Even though it was a cloudy day, I wore my sunglasses. / We will be at the airport at eleven unless the bus is late.",
                        "explanation": "문맥에 따른 논리적 관계(양보, 조건, 시간)를 정밀하게 구성하는 부사절 접속사를 영작문에 적용합니다."
                    }
                ]
            },
            {
                "unit_number": 2,
                "unit_title": "Science & Future",
                "theme": "과학 기술과 미래 사회",
                "points": [
                    {
                        "point_num": 1,
                        "title": "동격의 접속사 that (the belief / news / fact that)",
                        "tag": "명사절",
                        "page": 50,
                        "image_path": "pages_cache/2학년_2학기_영어독해와작문_미래엔_p50.jpg",
                        "key_sentence": "This event is based on the belief that student voices play a vital role in making our school better. / We’re delighted to announce the news that the elections will be held.",
                        "explanation": "학술적인 글에서 주장이나 증거를 도입할 때 가장 핵심적으로 쓰이는 추상명사 + 완전한 that절 동격 구문입니다."
                    },
                    {
                        "point_num": 2,
                        "title": "명사를 수식하는 분사구 (현재분사 / 과거분사 후치수식)",
                        "tag": "분사",
                        "page": 50,
                        "image_path": "pages_cache/2학년_2학기_영어독해와작문_미래엔_p50.jpg",
                        "key_sentence": "The boy injured in the accident will be taken to the hospital. / The woman giving f irst aid will take him to the hospital.",
                        "explanation": "주격 관계대명사 + be동사가 생략된 형태로, 명사 뒤에서 구를 이루어 능동(~ing)과 수동(p.p.)의 의미를 더해줍니다."
                    }
                ]
            },
            {
                "unit_number": 3,
                "unit_title": "Media & Truth",
                "theme": "미디어의 진실성과 딥페이크",
                "points": [
                    {
                        "point_num": 1,
                        "title": "현재완료 수동태 (have/has been + p.p.)",
                        "tag": "수동태",
                        "page": 74,
                        "image_path": "pages_cache/2학년_2학기_영어독해와작문_미래엔_p74.jpg",
                        "key_sentence": "Recently, remarkable progress has been made in generating fake content. / Social media platforms have been aﬀected by the spread of misleading content.",
                        "explanation": "과거부터 현재까지 완료되었거나 진행 중인 수동적 행위를 나타내며 시사·보도문에서 필수적으로 사용됩니다."
                    },
                    {
                        "point_num": 2,
                        "title": "결과 및 동시동작을 나타내는 분사구문 (~ing)",
                        "tag": "분사",
                        "page": 74,
                        "image_path": "pages_cache/2학년_2학기_영어독해와작문_미래엔_p74.jpg",
                        "key_sentence": "These images pose considerable risks, raising concerns about their potential misuse to harm individuals or societies.",
                        "explanation": "콤마 뒤의 현재분사가 앞 절 전체 내용에 따른 결과나 파급 효과(~하여 결국 ...하다)를 유려하게 표현합니다."
                    }
                ]
            },
            {
                "unit_number": 4,
                "unit_title": "Empathy & Society",
                "theme": "공감과 포용의 공동체",
                "points": [
                    {
                        "point_num": 1,
                        "title": "관계대명사의 계속적 용법 (, who / , which)",
                        "tag": "관계사",
                        "page": 98,
                        "image_path": "pages_cache/2학년_2학기_영어독해와작문_미래엔_p98.jpg",
                        "key_sentence": "R. J. Palacio’s novel Wonder is a touching story about a boy named August, who looks diﬀerent from others. / Wonder teaches us about the importance of showing kindness, which is easier said than done.",
                        "explanation": "문장의 흐름을 끊지 않고 앞의 특정 인물이나 앞선 문장 전체에 대해 부가적 설명을 전개합니다."
                    },
                    {
                        "point_num": 2,
                        "title": "강조 구문 (It is ~ that ...)",
                        "tag": "특수구문",
                        "page": 98,
                        "image_path": "pages_cache/2학년_2학기_영어독해와작문_미래엔_p98.jpg",
                        "key_sentence": "It is kindness that connects people together in our school community.",
                        "explanation": "문장의 특정 구성 성분(주어, 목적어, 부사구)을 강조하기 위해 It is와 that 사이에 배치하는 강조 기법입니다."
                    }
                ]
            },
            {
                "unit_number": 5,
                "unit_title": "Economic Choices",
                "theme": "경제적 선택과 동기 부여",
                "points": [
                    {
                        "point_num": 1,
                        "title": "전치사의 목적어로 쓰인 의문사 + to부정사",
                        "tag": "to부정사",
                        "page": 122,
                        "image_path": "pages_cache/2학년_2학기_영어독해와작문_미래엔_p122.jpg",
                        "key_sentence": "Worried about how to avoid paying the tax, he struggled to f ind a solution.",
                        "explanation": "전치사(about 등)의 목적어로 'how to-v' 명사구를 결합하여 문제 해결 방안을 압축 표현합니다."
                    },
                    {
                        "point_num": 2,
                        "title": "조동사 + have p.p. (should / could / must have)",
                        "tag": "조동사",
                        "page": 122,
                        "image_path": "pages_cache/2학년_2학기_영어독해와작문_미래엔_p122.jpg",
                        "key_sentence": "Rob must have eaten my cake. / I could have gone to bed early, but I didn't. / I should have had breakfast this morning.",
                        "explanation": "과거 사실에 대한 강한 확신(must), 유감·후회(should), 실현되지 않은 가능성(could)을 구별하여 영작합니다."
                    }
                ]
            },
            {
                "unit_number": 6,
                "unit_title": "Global Citizens",
                "theme": "지구 생태 보존과 미래 유산",
                "points": [
                    {
                        "point_num": 1,
                        "title": "상관접속사와 다중 병렬 구조 (either A or B / not only A but also B)",
                        "tag": "접속사",
                        "page": 146,
                        "image_path": "pages_cache/2학년_2학기_영어독해와작문_미래엔_p146.jpg",
                        "key_sentence": "This facility is either called “the most important room in the world” or referred to as the ultimate insurance policy. / He not only works as a writer, but also teaches English.",
                        "explanation": "A와 B의 문법적 형태 일치(수동태 과거분사구 일치 등)를 통해 복잡한 문장의 균형미를 완성합니다."
                    },
                    {
                        "point_num": 2,
                        "title": "간접의문문 및 명사절 접속사 whether / if",
                        "tag": "명사절",
                        "page": 146,
                        "image_path": "pages_cache/2학년_2학기_영어독해와작문_미래엔_p146.jpg",
                        "key_sentence": "Let me check whether/if there are computers available. / Hello. I’m wondering whether/if I can use the Internet in the library.",
                        "explanation": "의문사가 없는 의문문을 목적어로 받을 때 불확실성(~인지 아닌지)을 나타내는 명사절을 구성합니다."
                    }
                ]
            }
        ]
    },
    {
        "id": "eng_2",
        "grade": "3학년",
        "semester": "1학기",
        "curriculum_type": "일반선택 과목",
        "subject": "영어Ⅱ",
        "publisher": "엔이능률 (오선영)",
        "summary": "고교 영어 문법의 최상위 종합 단계로, 과거완료 수동태, 전치사구 강조 구문, 복합관계대명사(whoever/whatever), 제안·요구 당위성 동사원형, 전치사+관계대명사 등 대학 수학능력시험 고난도 어법 문항의 핵심 문형을 완성합니다.",
        "units": [
            {
                "unit_number": 1,
                "unit_title": "Two Heroes Who Fought a Deadly Disease",
                "theme": "의학의 발전과 과학자의 사회적 헌신",
                "points": [
                    {
                        "point_num": 1,
                        "title": "과거완료 수동태 (had been + p.p.)",
                        "tag": "수동태",
                        "page": 25,
                        "image_path": "pages_cache/3학년_1학기_영어Ⅱ_능률_p25.jpg",
                        "key_sentence": "The cause of the disease had been identified in 1906, but the vaccines that had been developed were ineffective. / Dinner had been prepared by the time the guests arrived.",
                        "explanation": "과거의 기준 시점보다 더 이전에 수동적으로 완료된 동작을 나타내며, 대과거와 수동태의 결합 구조를 마스터합니다."
                    },
                    {
                        "point_num": 2,
                        "title": "주절 과거 시제와 목적절 대과거 시제 일치",
                        "tag": "시제",
                        "page": 25,
                        "image_path": "pages_cache/3학년_1학기_영어Ⅱ_능률_p25.jpg",
                        "key_sentence": "The chief of the police announced that the criminal had been arrested. / He noticed that the hotel room had been cleaned.",
                        "explanation": "주절의 과거 동사보다 먼저 일어난 종속절의 사건을 과거완료로 정확하게 표현하는 시제 일치 법칙입니다."
                    }
                ]
            },
            {
                "unit_number": 2,
                "unit_title": "A Sustainable Future",
                "theme": "지속 가능한 환경과 기업의 책임(CSR)",
                "points": [
                    {
                        "point_num": 1,
                        "title": "전치사구/방법 강조 구문 (It is by ~ that ...)",
                        "tag": "특수구문",
                        "page": 51,
                        "image_path": "pages_cache/3학년_1학기_영어Ⅱ_능률_p51.jpg",
                        "key_sentence": "“It is by working together that we can create a sustainable future!” / It was Sue that recommended the movie Elemental to me.",
                        "explanation": "단순한 명사 강조를 넘어 수단이나 방법을 나타내는 전치사구(by working together)를 문두로 빼내어 강조하는 고급 구문입니다."
                    },
                    {
                        "point_num": 2,
                        "title": "장소·시간 부사구 강조 구문",
                        "tag": "특수구문",
                        "page": 51,
                        "image_path": "pages_cache/3학년_1학기_영어Ⅱ_능률_p51.jpg",
                        "key_sentence": "It was on Fifth Street that the man crashed into a taxi yesterday. / It was yesterday that the meeting was held.",
                        "explanation": "부사구를 강조할 때 that은 문맥에 따라 where나 when으로 호환되어 쓰일 수 있음을 학습합니다."
                    }
                ]
            },
            {
                "unit_number": 3,
                "unit_title": "The Power of Words",
                "theme": "언어의 힘과 사회적 소통",
                "points": [
                    {
                        "point_num": 1,
                        "title": "복합관계대명사 (whoever / whatever)",
                        "tag": "관계사",
                        "page": 77,
                        "image_path": "pages_cache/3학년_1학기_영어Ⅱ_능률_p77.jpg",
                        "key_sentence": "Whoever wants to cut down on sugar will love this menu. (= Anyone who wants to ...) / This app will translate whatever you type into a different language.",
                        "explanation": "선행사를 자체에 포함하며 '~하는 사람은 누구든지'(= Anyone who), '~하는 것은 무엇이든지'(= Anything that)의 명사절을 이끕니다."
                    },
                    {
                        "point_num": 2,
                        "title": "관계대명사 목적격 및 전치사 + 관계대명사",
                        "tag": "관계사",
                        "page": 77,
                        "image_path": "pages_cache/3학년_1학기_영어Ⅱ_능률_p77.jpg",
                        "key_sentence": "The quotes paying attention to the structures in bold ... / the person to whom I spoke yesterday",
                        "explanation": "전치사가 관계대명사 앞으로 이동하는 구조와 분사 수식어로의 축약 과정을 심화 학습합니다."
                    }
                ]
            },
            {
                "unit_number": 4,
                "unit_title": "Healthy Body, Healthy Mind",
                "theme": "신체 건강과 정신적 웰빙",
                "points": [
                    {
                        "point_num": 1,
                        "title": "요구·제안·명령 동사 뒤 that절의 (should) + 동사원형",
                        "tag": "특수구문",
                        "page": 103,
                        "image_path": "pages_cache/3학년_1학기_영어Ⅱ_능률_p103.jpg",
                        "key_sentence": "The guard requested that I (should) show my ID card. / Ryan demanded that Amy (should) apologize for her behavior. / They insisted that everyone attend the meeting.",
                        "explanation": "주절의 시제가 과거이더라도 that절의 동사는 조동사 should가 생략된 '동사원형'을 유지해야 하는 수능 어법의 대표 빈출 유형입니다."
                    },
                    {
                        "point_num": 2,
                        "title": "당위성(should V) vs 사실 주장(직설법) 구별",
                        "tag": "특수구문",
                        "page": 103,
                        "image_path": "pages_cache/3학년_1학기_영어Ⅱ_능률_p103.jpg",
                        "key_sentence": "insisted that everyone attend (당위: 참석해야 한다고 주장) vs. insisted that he had witnessed (사실: 목격했다고 진술)",
                        "explanation": "동일한 insist, suggest 동사라도 의무/당위를 나타내는지 단순한 사실 확인인지를 문맥으로 판단하는 능력을 기릅니다."
                    }
                ]
            },
            {
                "unit_number": 5,
                "unit_title": "Exploring the Unknown",
                "theme": "미지의 세계 탐험과 지적 호기심",
                "points": [
                    {
                        "point_num": 1,
                        "title": "동격의 접속사 that (the news / rumor / fact that)",
                        "tag": "명사절",
                        "page": 129,
                        "image_path": "pages_cache/3학년_1학기_영어Ⅱ_능률_p129.jpg",
                        "key_sentence": "I heard the news that his novel was published last week. / The rumor that the medicine didn’t work was proven wrong by the test.",
                        "explanation": "선행사가 명사이면서 관계대명사절과 형태가 유사하지만, 뒷 문장이 완전한 절을 이끄는 접속사 that의 특성을 최종 정리합니다."
                    },
                    {
                        "point_num": 2,
                        "title": "전치사가 뒤에 남는 관계대명사의 생략",
                        "tag": "관계사",
                        "page": 129,
                        "image_path": "pages_cache/3학년_1학기_영어Ⅱ_능률_p129.jpg",
                        "key_sentence": "The position [that/which] you applied for has already been filled. / the solution they arrived at",
                        "explanation": "관계대명사가 생략되고 전치사가 문장 끝에 남는 구어적·문어적 복합 구조를 분석합니다."
                    }
                ]
            }
        ]
    },
    {
        "id": "world_culture_eng",
        "grade": "3학년",
        "semester": "1학기",
        "curriculum_type": "진로선택 과목",
        "subject": "세계 문화와 영어",
        "publisher": "비상 (권혁승)",
        "summary": "개별 문법 규칙의 암기를 지양하고, 1~2학년에서 익힌 통사 구조를 실제 글로벌 소통(World Englishes), 대륙별 문화 비교 탐구, 영문 프로젝트(기획서·홍보물 작성)에 직접 적용하는 실용 융합 교과목입니다.",
        "units": [
            {
                "unit_number": 1,
                "unit_title": "Asia: Old Traditions and New Lifestyles",
                "theme": "아시아의 전통과 현대적 삶의 공존",
                "points": [
                    {
                        "point_num": 1,
                        "title": "실용 의사소통 및 상호문화 소통 표현 (World Englishes)",
                        "tag": "의사소통",
                        "page": 8,
                        "image_path": "pages_cache/3학년_1학기_세계_문화와_영어_비상_p8.jpg",
                        "key_sentence": "Exploring diverse cultural perspectives through authentic English texts and project activities.",
                        "explanation": "문법을 도구로 활용하여 아시아 여러 국가의 문화적 정체성과 현대 생활양식을 영어로 조사하고 발표하는 프로젝트 중심 학습입니다."
                    }
                ]
            },
            {
                "unit_number": 2,
                "unit_title": "Africa: Wildlife Conservation and Future Potential",
                "theme": "아프리카 야생동물 보존과 예술",
                "points": [
                    {
                        "point_num": 1,
                        "title": "탐구 보고서 작성 및 정보 시각화 프로젝트 (Infographic & Report)",
                        "tag": "프로젝트",
                        "page": 6,
                        "image_path": "pages_cache/3학년_1학기_세계_문화와_영어_비상_p6.jpg",
                        "key_sentence": "Synthesizing research data into persuasive written arguments and cultural presentations.",
                        "explanation": "환경과 예술을 주제로 복합 문장 구조를 활용하여 실전 인포그래픽 및 영문 탐구 보고서를 완성합니다."
                    }
                ]
            }
        ]
    }
]

