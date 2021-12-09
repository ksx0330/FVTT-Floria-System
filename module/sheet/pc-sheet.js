
export class FloriaPCSheet extends ActorSheet {

  /** @override */
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      classes: ["floria", "sheet", "actor"],
      template: "systems/floria/templates/sheet/actor/pc-sheet.html",
      width: 850,
      height: 730,
      tabs: [{navSelector: ".sheet-tabs", contentSelector: ".sheet-body", initial: "description"}],
      dragDrop: [{dragSelector: ".item-list .item", dropSelector: null}]
    });
  }

  /* -------------------------------------------- */

  /** @inheritdoc */
  getData(options) {
    let isOwner = false;
    let isEditable = this.isEditable;
    let data = super.getData(options);
    let items = {};
    let actorData = {};

    isOwner = this.document.isOwner;
    isEditable = this.isEditable;

    // The Actor's data
    actorData = this.actor.data.toObject(false);
    data.actor = actorData;
    data.data = actorData.data;

    // Owned Items
    data.items = actorData.items;
    for ( let i of data.items ) {
      const item = this.actor.items.get(i._id);
      i.labels = item.labels;
    }
    data.items.sort((a, b) => (a.sort || 0) - (b.sort || 0));
    this._prepareCharacterItems(actorData, data.items);

    console.log(data);

    return data;
  }

  /* -------------------------------------------- */

  _prepareCharacterItems(actorData, items) {
    const skill = [];
    const magic = [];
    const friend = [];
    const haveItem = [];

    for (let i of items) {

      if (i.type == 'skill')
        skill.push(i);
      else if (i.type == 'magic')
        magic.push(i);
      else if (i.type == 'friend')
        friend.push(i);
      else if (i.type == 'item')
        haveItem.push(i);
    }

    // Assign and return
    actorData.skill = skill;
    actorData.magic = magic;
    actorData.friend = friend;
    actorData.haveItem = haveItem;
  }

  /* -------------------------------------------- */

  /** @inheritdoc */
  activateListeners(html) {
    super.activateListeners(html);

    // Everything below here is only needed if the sheet is editable
    if ( !this.isEditable ) return;

    // Owned Item management
    html.find('.item-create').click(this._onItemCreate.bind(this));
    html.find('.item-edit').click(this._onItemEdit.bind(this));
    html.find('.item-delete').click(this._onItemDelete.bind(this));

    // Show Item
    html.find('.item-label').click(this._showItemDetails.bind(this));
    html.find(".echo-item").click(this._echoItemDescription.bind(this));

    html.find('.roll-magic').click(async ev => {
      await this.document.rollDice("mental", this.document.data.data.attributes.magic.attr, "마법 행사");
    });
    
    html.find('.roll-search').click(async ev => {
      await this.document.rollDice("trick", "wisdom", "탐색");
    });

    html.find(".roll-damage").click(async ev => {
      await this.document.rollDamage();
    });

    html.find(".roll-btn").click(async ev => {
      await this.document.rollDiceDialog();
    })
  }

  /* -------------------------------------------- */
   
  /**
   * Handle creating a new Owned Item for the actor using initial data defined in the HTML dataset
   * @param {Event} event   The originating click event
   * @private
   */
  async _onItemCreate(event) {
    event.preventDefault();
    const header = event.currentTarget;
    const type = header.dataset.type;
    const data = duplicate(header.dataset);

    if (type == 'item')
      data.class = data.talenttype;
    else
      data.talentType = data.talenttype;

    const name = `New ${type.capitalize()}`;
    const itemData = {
      name: name,
      type: type,
      data: data
    };
    delete itemData.data["type"];
    await this.actor.createEmbeddedDocuments('Item', [itemData], {});
  }

  /* -------------------------------------------- */

  /**
   * Handle editing an existing Owned Item for the Actor
   * @param {Event} event   The originating click event
   * @private
   */
  _onItemEdit(event) {
    event.preventDefault();
    const li = event.currentTarget.closest(".item");
    const item = this.actor.items.get(li.dataset.itemId);
    item.sheet.render(true);
  }

  /* -------------------------------------------- */

  /**
   * Handle deleting an existing Owned Item for the Actor
   * @param {Event} event   The originating click event
   * @private
   */
  _onItemDelete(event) {
    event.preventDefault();
    const li = event.currentTarget.closest(".item");
    let item = this.actor.items.get(li.dataset.itemId);
    item.delete();
  }

  /* -------------------------------------------- */

  _showItemDetails(event) {
    event.preventDefault();
    const toggler = $(event.currentTarget);
    const item = toggler.parents('.item');
    const description = item.find('.item-description');

    toggler.toggleClass('open');
    description.slideToggle();
  }

  /* -------------------------------------------- */

  _echoItemDescription(event) {
    event.preventDefault();
    const li = $(event.currentTarget).parents('.item');

    this.actor._echoItemDescription(li[0].dataset.itemId);
  }

  /* -------------------------------------------- */

}