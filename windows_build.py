import os
import shutil
import json

###############################
### 0. Read 'manifest.json' ###
with open('./manifest.json') as json_file:
    meta_json_data = json.load(json_file)

APP_NAME = meta_json_data['APP_NAME']

# ELECTRON_PACKAGE_PATH = meta_json_data['ELECTRON_PACKAGE_PATH']
USER_CODE_PATH = meta_json_data['USER_CODE_PATH']
ELECTRON_MAIN_JS_PATH = meta_json_data['ELECTRON_MAIN_JS_PATH']
ELECTRON_ICON_PATH = meta_json_data['ELECTRON_ICON_PATH']

ELECTRON_PACKAGE_PATH = os.getcwd()

with open('package.json','r') as json_file:
  package_json = json.load(json_file)

#############################
### Init Electron Project ###
#############################

## make Electron Project template ##

# prereq : nodejs, npm, yarn

# make 'package.json'
package_json["name"] = APP_NAME
package_json["build"]["win"]["icon"] = "./test_icon.ico"

with open('package.json', 'w') as make_file:
    json.dump(package_json, make_file, ensure_ascii=False, indent=4)

# install electron
os.system("yarn add electron --dev")

# make 'index.js'
shutil.copy(ELECTRON_MAIN_JS_PATH, ELECTRON_PACKAGE_PATH)
shutil.copy(ELECTRON_ICON_PATH , ELECTRON_PACKAGE_PATH)

## Get user's code (html + '.js') ##

for target in os.listdir(USER_CODE_PATH):
  path = USER_CODE_PATH + "/" + target
  if os.path.isdir(path):
    shutil.copytree(path, ELECTRON_PACKAGE_PATH + "/" + target)
  else:
    shutil.copyfile(path, ELECTRON_PACKAGE_PATH + "/" + target)

os.system("yarn dist")