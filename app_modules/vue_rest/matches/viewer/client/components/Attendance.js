export default {
  props: ['attendance'],
  template: `
    <div class="row blue white-text" style="margin-left: 0px; margin-right: 0px">
      <div class="col-xs-4" style="padding-left: 20px">T. Attendance: {{this.attendance.total}} </div>
      <div class="col-xs-2">C-Side: {{this.attendance.courtSide}}</div>
      <div class="col-xs-2">C-End: {{this.attendance.courtEnd}}</div>
      <div class="col-xs-2">Upper: {{this.attendance.upperLevel}}</div>
      <div class="col-xs-2">VIP: {{this.attendance.vip}}</div>
    </div>
  `
};