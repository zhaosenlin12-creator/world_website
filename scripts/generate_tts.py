import asyncio, edge_tts, os

OUT = 'public/audio/tts'
os.makedirs(OUT, exist_ok=True)

VOICE = 'zh-CN-XiaoxiaoNeural'

# 每个条目: 文件名 + 文案
items = [
    ('target-locked', '目标锁定，任务简报已展开。'),
    ('approach', '进入接近窗口，准备修正姿态。'),
    ('entry', '切入目标轨道，注意引力与障碍变化。'),
    ('atmosphere', '即将穿越大气层，控制热防护与减速节奏。'),
    ('landing-transition', '进入缓降通道，准备着陆程序。'),
    ('fragile-warning', '前方脆弱平台即将塌裂，立即转移。'),
    ('hazard-warning', '检测到危险并撞，注意避让。'),
    ('respawn-warning', '已回收到最近安全点，重新规划路线。'),
    ('sample-collected', '已回收关键样本，任务进度提升。'),
    ('touchdown', '着陆确认完成，准备展开地表探索。'),
]

async def one(name, text):
    communicate = edge_tts.Communicate(text, VOICE)
    await communicate.save(os.path.join(OUT, f'{name}.mp3'))
    print('OK', name)

async def main():
    await asyncio.gather(*(one(n, t) for n, t in items))

asyncio.run(main())
