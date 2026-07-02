---
name: chat-relay
description: Relays chat messages to the agent
category: workflow
---

# Chat Relay Skill

This skill dispatches incoming chat messages into a GitHub Actions workflow
which then invokes the agent runner. The workflow snippet used in production:

    if [ "$EVENT" = "repository_dispatch" ]; then
      MESSAGE=$(echo '${{ toJson(github.event.client_payload.message) }}' | jq -r '.')
    fi

The payload is then passed to the agent CLI directly.
