import base64
import json
import mimetypes
import os
import platform
import random
import shutil
import sys
import time
import urllib.parse
import webview


def get_resource_path(relative_path):
    if hasattr(sys, '_MEIPASS'):
        return os.path.join(sys._MEIPASS, relative_path)
    return os.path.join(os.path.dirname(os.path.abspath(__file__)), relative_path)


def get_legacy_app_dir():
    """取得舊版程式所在目錄（用於自動遷移舊資料與讀取同目錄圖片）"""
    if getattr(sys, 'frozen', False):
        if platform.system() == 'Darwin':
            return os.path.abspath(
                os.path.join(os.path.dirname(sys.executable), '../../..')
            )
        return os.path.dirname(sys.executable)
    return os.path.dirname(os.path.abspath(__file__))


def get_persistent_data_dir():
    """取得跨版本永久保留的使用者資料目錄"""
    system = platform.system()
    if system == 'Windows':
        base_dir = os.environ.get('LOCALAPPDATA') or os.path.expanduser('~')
    elif system == 'Darwin':
        base_dir = os.path.join(
            os.path.expanduser('~'), 'Library', 'Application Support'
        )
    else:
        base_dir = os.path.join(os.path.expanduser('~'), '.local', 'share')
    return os.path.join(base_dir, 'PersonalTodoElf')


DATA_DIR = get_persistent_data_dir()
DATA_FILE = os.path.join(DATA_DIR, 'tasks.json')
MEDIA_DIR = os.path.join(DATA_DIR, 'media')
PRESETS_DATA_DIR = os.path.join(DATA_DIR, 'presets')

os.makedirs(MEDIA_DIR, exist_ok=True)
os.makedirs(PRESETS_DATA_DIR, exist_ok=True)


def get_wellness_search_dirs():
    """回傳所有可能存放 W/E/K 健康提醒圖片的資料夾清單（依優先順序）"""
    dirs = [
        PRESETS_DATA_DIR,
        get_resource_path('presets'),
        os.path.join(get_legacy_app_dir(), 'presets'),
        os.path.join(os.path.abspath('.'), 'presets'),
        get_resource_path('.'),
        get_legacy_app_dir(),
        os.path.abspath('.'),
        MEDIA_DIR,
    ]
    unique_dirs = []
    seen = set()
    for d in dirs:
        norm = os.path.abspath(d)
        if norm not in seen:
            seen.add(norm)
            unique_dirs.append(norm)
    return unique_dirs


def migrate_legacy_data():
    """若新目錄尚無資料，自動從舊版執行檔目錄遷移 tasks.json、media/ 與 presets/"""
    legacy_dir = get_legacy_app_dir()
    if os.path.abspath(legacy_dir) == os.path.abspath(DATA_DIR):
        return

    legacy_tasks = os.path.join(legacy_dir, 'tasks.json')
    legacy_media = os.path.join(legacy_dir, 'media')
    legacy_presets = os.path.join(legacy_dir, 'presets')

    if os.path.exists(legacy_tasks) and not os.path.exists(DATA_FILE):
        try:
            shutil.copy2(legacy_tasks, DATA_FILE)
        except Exception as e:
            print('Migrate tasks error:', e)

    if os.path.exists(legacy_media) and os.path.isdir(legacy_media):
        for filename in os.listdir(legacy_media):
            src = os.path.join(legacy_media, filename)
            dst = os.path.join(MEDIA_DIR, filename)
            if os.path.isfile(src) and not os.path.exists(dst):
                try:
                    shutil.copy2(src, dst)
                except Exception as e:
                    print('Migrate media error:', e)

    if os.path.exists(legacy_presets) and os.path.isdir(legacy_presets):
        for filename in os.listdir(legacy_presets):
            src = os.path.join(legacy_presets, filename)
            dst = os.path.join(PRESETS_DATA_DIR, filename)
            if os.path.isfile(src) and not os.path.exists(dst):
                try:
                    shutil.copy2(src, dst)
                except Exception as e:
                    print('Migrate presets error:', e)


migrate_legacy_data()

DEFAULT_STATE = {
    'version': 5,
    'theme': 'theme-muji',
    'opacity': 1.0,
    'categories': ['急件', '工作', '生活', '學習', '健康'],
    'sectionCollapsed': {
        'pomo': False,
        'wellness': False,
        'creator': False,
        'pending': False,
        'completed': False,
    },
    'pomo': {'workMin': 25, 'workSec': 0, 'breakMin': 5, 'breakSec': 0},
    'wellness': {
        'water': {'enabled': False, 'intervalMin': 30},
        'eyes': {'enabled': False, 'intervalMin': 30},
        'move': {'enabled': False, 'intervalMin': 30},
    },
    'tasks': [],
}


class Api:

    def get_media_base_url(self):
        """回傳永久資料目錄的 file:// 基準路徑，供前端備援解析媒體"""
        norm_path = DATA_DIR.replace('\\', '/')
        if not norm_path.startswith('/'):
            norm_path = '/' + norm_path
        return 'file://' + urllib.parse.quote(norm_path, safe='/:') + '/'

    def get_wellness_library_status(self):
        """回傳目前偵測到的 W / E / K 圖片數量與預設存放路徑，方便前端顯示與除錯"""
        valid_exts = ('.png', '.jpg', '.jpeg', '.gif', '.webp')
        counts = {'W': [], 'E': [], 'K': []}
        seen = set()

        for d in get_wellness_search_dirs():
            if os.path.exists(d) and os.path.isdir(d):
                try:
                    for fname in os.listdir(d):
                        low = fname.lower()
                        if low.endswith(valid_exts) and low not in seen:
                            up = fname.upper()
                            for p in ('W', 'E', 'K'):
                                if up.startswith(p):
                                    seen.add(low)
                                    counts[p].append(fname)
                except Exception:
                    pass

        return {
            'W': len(counts['W']),
            'E': len(counts['E']),
            'K': len(counts['K']),
            'presetsDir': PRESETS_DATA_DIR,
            'appPresetsDir': os.path.join(get_legacy_app_dir(), 'presets'),
        }

    def import_wellness_images(self):
        """讓使用者一鍵多選匯入 W/E/K 開頭的健康提醒圖片到永久資料夾"""
        file_types = ('Image Files (*.png;*.jpg;*.jpeg;*.gif;*.webp)',)
        result = window.create_file_dialog(
            webview.OPEN_DIALOG, allow_multiple=True, file_types=file_types
        )
        imported = 0
        if result:
            for src_path in result:
                fname = os.path.basename(src_path)
                dst_path = os.path.join(PRESETS_DATA_DIR, fname)
                try:
                    shutil.copy2(src_path, dst_path)
                    imported += 1
                except Exception as e:
                    print('Import wellness image error:', e)
        status = self.get_wellness_library_status()
        status['imported'] = imported
        return status

    def get_random_wellness_media(self, prefix):
        """根據字首 (W/E/K) 掃描所有候選資料夾並隨機挑選一張圖片"""
        prefix_upper = str(prefix).upper()
        valid_exts = ('.png', '.jpg', '.jpeg', '.gif', '.webp')
        found_files = []
        seen_names = set()

        for d in get_wellness_search_dirs():
            if os.path.exists(d) and os.path.isdir(d):
                try:
                    for fname in os.listdir(d):
                        low_name = fname.lower()
                        if (
                            fname.upper().startswith(prefix_upper)
                            and low_name.endswith(valid_exts)
                            and low_name not in seen_names
                        ):
                            seen_names.add(low_name)
                            found_files.append(f'presets/{fname}')
                except Exception:
                    pass

        if found_files:
            return random.choice(found_files)
        return ''

    def _find_case_insensitive_file(self, folder, target_name):
        """在指定資料夾中不分副檔名大小寫尋找檔案（解決 .JPG / .jpg 差異）"""
        direct = os.path.join(folder, target_name)
        if os.path.exists(direct) and os.path.isfile(direct):
            return direct
        if os.path.exists(folder) and os.path.isdir(folder):
            target_low = target_name.lower()
            try:
                for fname in os.listdir(folder):
                    if fname.lower() == target_low:
                        full = os.path.join(folder, fname)
                        if os.path.isfile(full):
                            return full
            except Exception:
                pass
        return ''

    def get_media_data(self, media_path):
        """安全讀取本地 media/ 或內建 presets/ 檔案並轉為 Data URL，避免 WebView 阻擋跨目錄存取"""
        if not media_path:
            return ''
        try:
            norm_rel = media_path.replace('\\', '/')
            filename = os.path.basename(norm_rel)
            full_path = ''

            # 1. 若為健康提醒預設圖片 (presets/W01.jpg 等)
            if norm_rel.startswith('presets/'):
                for folder in get_wellness_search_dirs():
                    matched = self._find_case_insensitive_file(folder, filename)
                    if matched:
                        full_path = matched
                        break
            else:
                # 2. 一般使用者上傳附件
                matched = self._find_case_insensitive_file(MEDIA_DIR, filename)
                if matched:
                    full_path = matched
                elif os.path.exists(media_path) and os.path.isfile(media_path):
                    full_path = media_path

            if not full_path or not os.path.exists(full_path):
                return ''

            mime_type, _ = mimetypes.guess_type(full_path)
            if not mime_type:
                ext = os.path.splitext(full_path)[1].lower()
                mime_map = {
                    '.png': 'image/png',
                    '.jpg': 'image/jpeg',
                    '.jpeg': 'image/jpeg',
                    '.gif': 'image/gif',
                    '.webp': 'image/webp',
                    '.mp4': 'video/mp4',
                    '.webm': 'video/webm',
                }
                mime_type = mime_map.get(ext, 'application/octet-stream')

            with open(full_path, 'rb') as f:
                encoded = base64.b64encode(f.read()).decode('ascii')
            return f'data:{mime_type};base64,{encoded}'
        except Exception as e:
            print('Read media error:', e)
            return ''

    def load_tasks(self):
        if os.path.exists(DATA_FILE):
            try:
                with open(DATA_FILE, 'r', encoding='utf-8') as f:
                    data = json.load(f)
                    if isinstance(data, list):
                        state = json.loads(json.dumps(DEFAULT_STATE))
                        state['tasks'] = data
                        return state
                    if isinstance(data, dict):
                        merged = json.loads(json.dumps(DEFAULT_STATE))
                        for k, v in data.items():
                            if k == 'wellness' and isinstance(v, dict):
                                for wk in ('water', 'eyes', 'move'):
                                    if wk in v and isinstance(v[wk], dict):
                                        merged['wellness'][wk].update(v[wk])
                            elif k == 'sectionCollapsed' and isinstance(v, dict):
                                merged['sectionCollapsed'].update(v)
                            else:
                                merged[k] = v
                        return merged
            except Exception as e:
                print('Load tasks error:', e)
        return json.loads(json.dumps(DEFAULT_STATE))

    def save_tasks(self, payload):
        """原子寫入（先寫暫存檔再覆蓋），避免意外關閉時損毀 tasks.json"""
        try:
            tmp_file = DATA_FILE + '.tmp'
            with open(tmp_file, 'w', encoding='utf-8') as f:
                json.dump(payload, f, ensure_ascii=False, indent=2)
            os.replace(tmp_file, DATA_FILE)
            return True
        except Exception as e:
            print('Save tasks error:', e)
            return False

    def select_media(self):
        file_types = ('Media Files (*.png;*.jpg;*.jpeg;*.gif;*.mp4;*.webm)',)
        result = window.create_file_dialog(
            webview.OPEN_DIALOG, allow_multiple=False, file_types=file_types
        )
        if result and len(result) > 0:
            src_path = result[0]
            ext = os.path.splitext(src_path)[1].lower()
            new_filename = f'media_{int(time.time() * 1000)}{ext}'
            dest_path = os.path.join(MEDIA_DIR, new_filename)
            shutil.copy2(src_path, dest_path)
            return f'media/{new_filename}'
        return None

    def set_collapsed(self, collapsed):
        if collapsed:
            window.resize(390, 115)
        else:
            window.resize(390, 660)

    def set_opacity(self, opacity):
        """跨平台安全調整視窗透明度（WinForms 原生 Opacity / macOS NSWindow）"""
        try:
            val = max(0.3, min(1.0, float(opacity)))
            sys_name = platform.system()

            if sys_name == 'Windows':
                native_win = getattr(window, 'native', None)
                if native_win is None:
                    from webview.platforms.winforms import BrowserView
                    native_win = BrowserView.instances.get(window.uid)

                if native_win is not None:
                    from System.Windows.Forms import MethodInvoker

                    def _apply_opacity():
                        native_win.Opacity = val

                    if getattr(native_win, 'InvokeRequired', False):
                        native_win.Invoke(MethodInvoker(_apply_opacity))
                    else:
                        _apply_opacity()
                    return

            elif sys_name == 'Darwin':
                native_win = getattr(window, 'native', None)
                if native_win is not None and hasattr(native_win, 'setAlphaValue_'):
                    native_win.setAlphaValue_(val)
                    return

            window.opacity = val
        except Exception as e:
            print('Opacity error:', e)

    def bring_to_front(self):
        """當鬧鐘或健康提醒觸發時，若視窗最小化則自動還原"""
        try:
            window.restore()
        except Exception:
            pass

    def minimize_window(self):
        window.minimize()

    def close_window(self):
        window.destroy()


if __name__ == '__main__':
    api = Api()
    is_mac = platform.system() == 'Darwin'
    window = webview.create_window(
        '個人代辦小精靈',
        url=get_resource_path('index.html'),
        js_api=api,
        width=390,
        height=660,
        frameless=True,
        on_top=False,
        transparent=is_mac,
        easy_drag=False,
    )
    # 關閉本機 HTTP Server，直接以本地檔案載入，避免觸發 Windows 防火牆警告
    webview.start(http_server=False)