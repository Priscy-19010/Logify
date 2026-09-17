import mongoose from "mongoose"

const DaySchema = new mongoose.Schema({
  label: {
    type: String,
    required: true
  },
  text: {
    type: String,
    default: ''
  },
  filled: {     // just to check if there's text without asking text
    type: Boolean,
    default: false
  },
  submitted: {
    type: Boolean,
    default: false
  },
  approved: {
    type: Boolean,
    default: false
  },
  approvedAt: {
    type: Date,
    default: null
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  }
})

const WeekSchema = new mongoose.Schema({
  label: {
    type: String,
    required: true
  },
  weekDone: {
    type: Boolean,
    default: false
  },
  weekMark: {
    type: Number,
    min: 0,
    max: 5,
    default: null
  },
  days: [DaySchema]
})

const MonthSchema = new mongoose.Schema({
  label: {
    type: String,
    required: true
  },
  deadline: {
    type: Date,
    required: true
  },
  submitted: {
    type: Boolean,
    default: false
  },
  locked: {   // once a month passes, nothin can be changed
    type: Boolean,
    default: false
  },
  secondPartyEmail: {
    type: String,
    default: null
  },
  submittedAt: {
    type: Date,
    default: null
  },
  weeks: [WeekSchema]
})

const LogbookSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true
    },
    months: [MonthSchema] // nesting
  },
  {
    timestamps: true
  }
)

const Logbook = mongoose.model("Logbook", LogbookSchema)
export default Logbook