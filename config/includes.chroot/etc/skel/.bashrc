# SomethingOS login shell
# Keep it quiet, readable, and useful.

[[ $- != *i* ]] && return

# Colours when the terminal can take them
if [[ -t 1 ]]; then
  _c='\[\e[38;2;62;224;197m\]'
  _d='\[\e[2m\]'
  _r='\[\e[0m\]'
else
  _c= _d= _r=
fi

PS1="${_c}\u${_r}${_d}@${_r}${_c}\h${_r} ${_d}\w${_r} ${_c}›${_r} "
PS2="${_c}…${_r} "

unset _c _d _r

export EDITOR="${EDITOR:-nano}"
export VISUAL="${VISUAL:-$EDITOR}"
export LESS="-R"
export HISTCONTROL=ignoredups:erasedups
export HISTSIZE=5000
export HISTFILESIZE=10000
shopt -s histappend checkwinsize

alias ls='ls --color=auto -F'
alias ll='ls -lah'
alias grep='grep --color=auto'
alias ..='cd ..'
alias fetch='something fetch'
alias posture='something status'

# First interactive terminal in a session gets neofetch.
if [[ -z "${SOMETHINGOS_FETCHED:-}" ]]; then
  export SOMETHINGOS_FETCHED=1
  if command -v neofetch >/dev/null 2>&1; then
    neofetch
  elif command -v something >/dev/null 2>&1; then
    something fetch
  fi
fi
