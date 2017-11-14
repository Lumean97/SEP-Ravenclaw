import data from '../../api/botData'
import * as types from '../mutation-types'

// initial state
const state = {
  bots: []
}

const getters = {
  getbots () {
    return this.state.bots
  },
  getName (state, bot) {
    return state.bots[state.bots.indexOf(bot)].name
  },
  getState (state, bot) {
    return state.bots[state.bots.indexOf(bot)].status
  }
}

const actions = {
  getAllBots ({commit}) {
    data.getBots(bots => {
      commit(types.RECEIVE_BOTS, { bots })
    })
  },
  addNewBot ({commit}, bot) {
    data.addNewBot(bot => {
      commit(types.ADD_NEW_BOT, {bot})
    }, bot)
  },
  deletebot ({commit}, bot) {
    data.deleteBot(bot => {
      commit(types.DETELE_BOT, { bot })
    }, bot)
  },
  ranameBot ({commit}, bot) {
    data.renameBot(bot => {
      commit(types.RENAME_BOT, { bot })
    }, bot)
  },
  changeStatus ({commit}, bot) {
    data.changeBotState(
            bot,
            () => commit(types.CHANGE_STATE_TO_START, { bot }),
            () => commit(types.CHANGE_STATE_TO_STOP, { bot })
        )
  }
}

const mutations = {
  [types.RECEIVE_BOTS] (state, { bots }) {
    state.bots = bots
  },
  [types.ADD_NEW_BOT] (state, { bot }) {
    state.bots.push(bot)
  },
  [types.DETELE_BOT] (state, { bot }) {
    state.bots.splice(state.bots.indexOf(bot), 1)
  },
  [types.RENAME_BOT] (state, { bot }) {
    state.bots[state.bots.indexOf(bot)].name = bot[1].name
  },
  [types.CHANGE_STATE_TO_START] (state, { bot }) {
    state.bots[state.bots.indexOf(bot)].status = 'Online'
  },
  [types.CHANGE_STATE_TO_STOP] (state, { bot }) {
    state.bots[state.bots.indexOf(bot)].status = 'Offline'
  }
}

export default {
  state,
  getters,
  mutations,
  actions
}
