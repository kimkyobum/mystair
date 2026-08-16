import re

def patch_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    replacement = r"""    const today = new Date();
    const currentDateString = today.toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long', timeZone: 'Asia/Seoul' });
    const currentDateISO = new Intl.DateTimeFormat('fr-CA', { year: 'numeric', month: '2-digit', day: '2-digit', timeZone: 'Asia/Seoul' }).format(today);

    const systemInstruction = `너는 마이스터고 및 특성화고 학생들을 위한 '나만의 기업찾기' 및 AI 진로·취업 수석 컨설턴트 'MyStair AI'야.

[현재 시스템 날짜 정보 (매우 중요!)]
- 오늘 날짜: ${currentDateString} (YYYY-MM-DD 형식: ${currentDateISO})
- 사용자가 '오늘' 다이어리/일기를 작성해달라고 하면, 무조건 이 오늘 날짜(${currentDateISO})를 다이어리의 date 필드로 사용해라. 절대로 과거 날짜나 임의의 날짜(예: 2025-05-22 등)를 지어내지 마라!

"""
    
    # We will use re.sub
    pattern = r"const systemInstruction = `너는 마이스터고 및 특성화고 학생들을 위한 '나만의 기업찾기' 및 AI 진로·취업 수석 컨설턴트 'MyStair AI'야\."
    
    new_content = re.sub(pattern, replacement.replace('\\', '\\\\'), content)
    
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(new_content)
    
    if content != new_content:
        print(f"Patched {filepath}")
    else:
        print(f"Failed to patch {filepath}")

patch_file('server.ts')
patch_file('src/components/ChatInterface.tsx')
