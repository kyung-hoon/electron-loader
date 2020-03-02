#!/usr/bin/env python
# -*- coding: utf-8 -*-
import os

# install nodejs (version 10 >=)
os.system("apt-get install curl")
os.system("curl -sL https://deb.nodesource.com/setup_10.x | sudo -E bash -")
os.system("sudo apt-get install -y nodejs")
os.system("sudo apt-get install npm")

# install yarn
os.system("npm install -g yarn")

# install wine
os.system("sudo dpkg --add-architecture i386")
os.system("wget -nc https://dl.winehq.org/wine-builds/winehq.key")
os.system("sudo apt-key add winehq.key")
os.system("sudo apt-get install software-properties-common")
os.system("sudo apt-add-repository 'deb https://dl.winehq.org/wine-builds/ubuntu/ bionic main'")
os.system("sudo apt update")
os.system("sudo add-apt-repository ppa:cybermax-dexter/sdl2-backport")
os.system("sudo apt update")
os.system("sudo apt install --install-recommends winehq-stable")

# install node global package
# install electron
os.system("yarn global add electron")
os.system("yarn global add electron-builder")

# env check
print("\n\n\n\n")
print("#######################")
print("env setting is done!!!!")
print("\nnode version: ")
os.system("node --version")
print("yarn version: ")
os.system("yarn --version")
print("wine version: ")
os.system("wine --version")