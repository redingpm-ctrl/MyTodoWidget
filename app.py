import ctypes
import json
import os
import platform
import shutil
import sys
import time
import webview


def get_resource_path(relative_path):
  if hasattr(sys, '_MEIPASS'):
    return os.path.join(sys._MEIPASS, relative_path)
  return os.path.join(os.path.abspath('.'), relative_path)


def get_app_dir():
  if getattr(sys, 'frozen', False):
    # Mac 打包成 .app 後，執行檔位於 MyApp.app/Contents/MacOS/ 內，需往上退三層回到外部資料夾
    if platform.system() == 'Darwin':
      return os.path.abspath(
          os.path.join(os.path.dirname(sys.executable), '../../..')
      )
    return os.path.dirname(sys.executable)
  return os.path.dirname(os.path.abspath(__file__))


APP_DIR = get_app_dir()
DATA_FILE = os.path.join(APP_DIR, 'tasks.json')
MEDIA_DIR = os.path.join(APP_DIR, 'media')

if not os.path.exists(MEDIA_DIR):
  os.makedirs(MEDIA_DIR)


class Api:

  def load_tasks(self):
    if os.path.exists(DATA_FILE):
      with open(DATA_FILE, 'r', encoding='utf-8') as f:
        return json.load(f)
    return []

  def save_tasks(self, tasks):
    with open(DATA_FILE, 'w', encoding='utf-8') as f:
      json.dump(tasks, f, ensure_ascii=False, indent=2)

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
      return dest_path.replace('\\', '/')
    return None

  def set_collapsed(self, collapsed):
    if collapsed:
      window.resize(390, 115)
    else:
      window.resize(390, 660)

  # 同時相容 Windows 與 macOS 的透明度調整
  def set_opacity(self, opacity):
    try:
      val = float(opacity)
      if platform.system() == 'Windows':
        hwnd = ctypes.windll.user32.GetForegroundWindow()
        style = ctypes.windll.user32.GetWindowLongW(hwnd, -20)
        ctypes.windll.user32.SetWindowLongW(hwnd, -20, style | 0x80000)
        alpha = int(val * 255)
        ctypes.windll.user32.SetLayeredWindowAttributes(hwnd, 0, alpha, 2)
      elif platform.system() == 'Darwin':  # macOS
        window.opacity = val
    except Exception as e:
      print('Opacity error:', e)

  def minimize_window(self):
    window.minimize()

  def close_window(self):
    window.destroy()


if __name__ == '__main__':
  api = Api()
  window = webview.create_window(
      '個人代辦小精靈',
      url=get_resource_path('index.html'),
      js_api=api,
      width=390,
      height=660,
      frameless=True,
      on_top=True,
      transparent=True,  # 讓 macOS 支援視窗透明度調整
      easy_drag=False,
  )
  webview.start()