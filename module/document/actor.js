
export class FloriaActor extends Actor {

  prepareData() {
    super.prepareData();

    if (this.data.type !== "pc")
      return;

    let values = {
      "body": { "value": this.data.data.attributes.body.value == "" ? 0 : this.data.data.attributes.body.value },
      "mental": { "value": this.data.data.attributes.mental.value == "" ? 0 : this.data.data.attributes.mental.value },
      "trick": { "value": this.data.data.attributes.trick.value == "" ? 0 : this.data.data.attributes.trick.value },
      "wisdom": { "value": this.data.data.attributes.wisdom.value == "" ? 0 : this.data.data.attributes.wisdom.value },
    }

    this.data.data.attributes.magic.value = values["mental"].value + values[this.data.data.attributes.magic.attr].value;
    this.data.data.attributes.search.value = values["trick"].value + values["wisdom"].value;
  }

  async rollDiceDialog() {

    let dialog = new Dialog({
      title: "주사위 굴림",
      content: `<p style="text-align: center; height: 30px">
        <select id="first">
          <option value="body">육체</option>
          <option value="mental">정신</option>
          <option value="trick">요령</option>
          <option value="wisdom">지혜</option>
        </select> + 
        <select id="second">
          <option value="body">육체</option>
          <option value="mental">정신</option>
          <option value="trick">요령</option>
          <option value="wisdom">지혜</option>
        </select></p>`,
      buttons: {
        confirm: {
          icon: '<i class="fas fa-check"></i>',
          label: '롤',
          callback: async () => {
            let first = $("#first").val();
            let second = $("#second").val();
            let data = {
              "body": "육체",
              "mental": "정신",
              "trick": "요령",
              "wisdom": "지혜"
            }

            await this.rollDice(first, second, data[first] + " + " + data[second]);
          }
        }
      },
      default: "confirm"
    }, {width: 100});

    dialog.render(true);
  }

  async rollDice(first, second, flavor) {
    let values = {
      "body": { "value": this.data.data.attributes.body.value == "" ? 0 : this.data.data.attributes.body.value },
      "mental": { "value": this.data.data.attributes.mental.value == "" ? 0 : this.data.data.attributes.mental.value },
      "trick": { "value": this.data.data.attributes.trick.value == "" ? 0 : this.data.data.attributes.trick.value },
      "wisdom": { "value": this.data.data.attributes.wisdom.value == "" ? 0 : this.data.data.attributes.wisdom.value },
    }
    let goal = values[first].value + values[second].value;

    // GM rolls.
    let chatData = {
        user: game.user._id,
        speaker: ChatMessage.getSpeaker({ actor: this }),
    };

    let rollMode = game.settings.get("core", "rollMode");
    if (["gmroll", "blindroll"].includes(rollMode)) chatData["whisper"] = ChatMessage.getWhisperRecipients("GM");
    if (rollMode === "selfroll") chatData["whisper"] = [game.user._id];
    if (rollMode === "blindroll") chatData["blind"] = true;

    let roll = new Roll("2d6");
    roll.roll();
    chatData.content = await renderTemplate("systems/floria/templates/dice/roll.html", {
        formula: roll.formula,
        flavor: flavor,
        user: game.user._id,
        tooltip: await roll.getTooltip(),
        total: Math.round(roll.total * 100) / 100,
        num: goal
    });

    if (game.dice3d) {
        game.dice3d.showForRoll(roll, game.user, true, chatData.whisper, chatData.blind).then(displayed => ChatMessage.create(chatData));;
    } else {
        chatData.sound = CONFIG.sounds.dice;
        ChatMessage.create(chatData);
    }

  }

  async rollDamage() {

    // GM rolls.
    let chatData = {
        user: game.user._id,
        speaker: ChatMessage.getSpeaker({ actor: this }),
    };

    let rollMode = game.settings.get("core", "rollMode");
    if (["gmroll", "blindroll"].includes(rollMode)) chatData["whisper"] = ChatMessage.getWhisperRecipients("GM");
    if (rollMode === "selfroll") chatData["whisper"] = [game.user._id];
    if (rollMode === "blindroll") chatData["blind"] = true;

    let roll = new Roll("2d6 + 2d6");
    roll.roll();

    chatData.content = await renderTemplate("systems/floria/templates/dice/damage.html", {
        formula: roll.formula,
        flavor: "대미지",
        user: game.user._id,
        tooltip: await roll.getTooltip(),
        x: roll.terms[0].total,
        y: roll.terms[2].total
    });

    if (game.dice3d) {
        game.dice3d.showForRoll(roll, game.user, true, chatData.whisper, chatData.blind).then(displayed => ChatMessage.create(chatData));;
    } else {
        chatData.sound = CONFIG.sounds.dice;
        ChatMessage.create(chatData);
    }
  }

  _echoItemDescription(itemId) {
    const item = this.items.get(itemId);

    let title = item.data.name;
    let description = item.data.data.description;

    if (item.data.img != 'icons/svg/item-bag.svg')
      title = `<img src="${item.data.img}" width="40" height="40">&nbsp&nbsp${title}` 

    if (item.data.type == 'skill') {
      description = `<table style="text-align: center;">
                      <tr>
                        <th>사용 조건</th>
                        <td>${item.data.data.timing}</th>
                      </tr>
                      <tr>
                        <th>비고</th>
                        <td>${item.data.data.note}</th>
                      </tr>

                    </table>${description}`
    } else if (item.data.type == "magic") {
      description = `<table style="text-align: center;">
                      <tr>
                        <th>코스트</th>
                        <td>${item.data.data.cost}</th>
                        <th>진영</th>
                        <td>${item.data.data.position}</th>
                      </tr>
                      <tr>
                        <th>비고</th>
                        <td colspan="3">${item.data.data.note}</th>
                      </tr>

                    </table>${description}`
    } else if (item.data.type == "friend") {
      description = `<table style="text-align: center;">
                      <tr>
                        <th>친밀도</th>
                        <td>${item.data.data.point}</th>
                        <th>체크</th>
                        <td>${item.data.data.used ? "O" : "X"}</th>
                      </tr>

                    </table>${description}`

    } else if (item.data.type == "item") {
      description = `<table style="text-align: center;">
                      <tr>
                        <th>레어도</th>
                        <td>${item.data.data.rarity}</th>
                      </tr>

                    </table>${description}`
    }

    // Render the roll.
    let template = 'systems/floria/templates/chat/chat-card.html';
    let templateData = {
      title: title,
      details: description
    };

    // GM rolls.
    let chatData = {
      user: game.user.id,
      speaker: ChatMessage.getSpeaker({ actor: this })
    };

    renderTemplate(template, templateData).then(content => {
      chatData.content = content;
      ChatMessage.create(chatData);
    });

  }



}