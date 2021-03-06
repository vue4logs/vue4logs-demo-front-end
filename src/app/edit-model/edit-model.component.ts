import { Component, OnInit, Input } from '@angular/core';
import { DataService } from '../data.service';
import { ChartDataSets, ChartOptions } from 'chart.js';
import { Color, Label, monkeyPatchChartJsLegend, monkeyPatchChartJsTooltip } from 'ng2-charts';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-edit-model',
  templateUrl: './edit-model.component.html',
  styleUrls: ['./edit-model.component.css']
})
export class EditModelComponent implements OnInit {
  groups: any;
  conf_file: any;
  log_file: any;
  arr = {};
  panelOpenState = false;
  edit: any;
  loadComponent: any;
  item: any;
  ischecked: any;
  selectedTemps = [];
  newTemp: any;
  newTemplate: any;
  splitArr: any;
  logId: any;
  checked: any;
  selectedLogs = [];
  a: any;
  pieChartLabels: string[] = [];
  pieChartData: number[] = [];
  pieChartType: string = 'pie';
  pieChartColors: Array < any > = [{
    backgroundColor: []//['#fc5858', '#19d863', '#fdf57d']
  }];
  pieColors: string[] = [];
  headlines = [];
  fileName: any;
  saved: any;

  constructor(private dataService: DataService, public dialog: MatDialog) {
    this.edit = false;
    this.loadComponent = false;
    this.saved = false;
    
  }

  ngOnInit() {

  }
  generateRgb(n){
    for(let i = 0; i < n; i++){
      var r = () => Math.random() * 256 >> 0;
      var color = `rgb(${r()}, ${r()}, ${r()})`;
      this.pieColors.push(color);
      // console.log('color',color);
    }
    this.pieChartColors[0]['backgroundColor'] = this.pieColors;
    // console.log('colors',this.pieColors);
  }
  public chartClicked(e: any): void {
    // console.log(e);
  }

  public chartHovered(e: any): void {
    // console.log(e);
  }
  config_fileChanged(e) {
    this.conf_file = e.target.files[0];
    this.uploadConfDocument(this.conf_file);

  }
  log_fileChanged(e) {
    this.log_file = e.target.files[0];
    this.uploadLogDocument(this.log_file);
  }
  uploadConfDocument(file) {
    let fileReader = new FileReader();
    fileReader.onload = (e) => {
      // console.log(fileReader.result);
      this.arr["conf"] = fileReader.result

    }
    fileReader.readAsText(this.conf_file);

  }

  uploadLogDocument(file) {
    let fileReader = new FileReader();
    
    fileReader.onload = (e) => {
      // console.log('file',file.name);
      this.fileName = file.name;
      this.arr["logs"] = fileReader.result
    }

    fileReader.readAsText(this.log_file);
  }

  submit() {
    this.edit = true;
    this.pieChartLabels = [];
    this.pieChartData = [];
    this.headlines = [];
    this.dataService.uploadData(this.arr).subscribe((data) => {
      // console.log(data);
      let regrouped_logs = this.groupByKey(data, 'EventTemplate');
      // console.log('regrouped_logs ', regrouped_logs)
      this.groups = regrouped_logs
      // console.log(this.groups)
      this.pieChartLabels = Object.keys(this.groups);
      // console.log('asdf', Object.keys(this.groups[this.pieChartLabels[0]][0]))
      // this.headlines.push(Object.keys(this.groups[this.pieChartLabels[0]][0]['EventId']));
      
      for (var i of this.pieChartLabels) {
        this.pieChartData.push(this.groups[i].length)
      }
      for (var i of this.pieChartLabels) {
        this.headlines.push(this.groups[i][0]['EventId'])
      }
      // console.log('headlines',this.headlines)
      this.generateRgb(this.pieChartData.length);

    }, error => {
      console.log("Not passed")
    });

  }

  groupByKey(array, key) {
    return array.reduce(function (rv, x) {
      (rv[x[key]] = rv[x[key]] || []).push(x);
      return rv;
    }, {});
  }
  merge() {
    this.loadComponent = true;
    this.edit = false;
    this.pieChartLabels = Object.keys(this.groups);
      // console.log('asdf', Object.keys(this.groups[this.pieChartLabels[0]][0]))
      this.headlines.push(Object.keys(this.groups[this.pieChartLabels[0]][0]));
      // console.log('headlines',this.headlines)
      for (var i of this.pieChartLabels) {
        this.pieChartData.push(this.groups[i].length)
      }
      this.generateRgb(this.pieChartData.length);
  }
  onChange(id: string, isChecked: boolean) {
    this.ischecked = isChecked
    this.item = id;
    // console.log(this.item)

    if (this.selectedTemps.includes(this.item)) {
      this.selectedTemps.splice(this.selectedTemps.indexOf(this.item), 1);

    }
    else {
      this.selectedTemps.push(this.item);
    }
    // console.log('selectedTemps:',this.selectedTemps)
  }

  saveChanges() {
    let temp = []
    this.pieChartLabels = [];
    this.pieChartData = [];
    this.headlines = [];
    for (var val of this.selectedTemps) {
      for (var i of this.groups[val]) {
        i['EventTemplate'] = this.newTemp; 
        temp.push(i)
      }

    }
    for (var val of this.selectedTemps) {
      delete this.groups[val];
    }

    this.groups[this.newTemp] = temp;
    // console.log('Groups: ',this.groups);

    this.pieChartLabels = Object.keys(this.groups);
    
    for (var j of this.pieChartLabels) {
      this.pieChartData.push(this.groups[j].length)
    }
    for (var k of this.pieChartLabels) {
      this.headlines.push(this.groups[k][0]['EventId'])
    }
    this.generateRgb(this.pieChartData.length);
    this.selectedTemps = []
  }

  splitTemplate(event, i, key) {
    this.a = key
    // console.log(i, key, 'i')
    // console.log(Object.keys(this.groups))
    // console.log(this.groups[key])
    this.splitArr = this.groups[key];
    // console.log("Split",this.splitArr);
  }

  onSelect(id, isChecked: boolean, index) {
    this.checked = isChecked
    this.logId = id;
    // console.log(this.selectedLogs.includes(index),index)
    if (this.selectedLogs.includes(index)) {
      this.selectedLogs.splice(this.selectedLogs.indexOf(index), 1);

      // 
    }
    else {
      this.selectedLogs.push(index);
      // console.log('hi', this.groups[this.logId['EventTemplate']])
    }
    // console.log('selectedLogs',this.selectedLogs);
  }

  save() {
    let l = [];
    this.pieChartLabels = [];
    this.pieChartData = [];
    this.headlines = [];
    // console.log("splitArr", this.splitArr)
    for (var k of this.selectedLogs) {
      // console.log('split_arr_k: ',this.splitArr[k])
      this.splitArr[k]['EventTemplate'] = this.newTemplate;
      l.push(this.splitArr[k]);
      
    }
    this.groups[this.newTemplate] = l;
    this.selectedLogs.sort((a,b) => b - a);
    // console.log('sorted_seesctedlogs',this.selectedLogs)
    for (var i of this.selectedLogs) {
      // console.log("start",i, this.groups[this.a][i])
      this.groups[this.a].splice(i,1);
      // this.groups[this.a].splice(this.groups[this.a].indexOf(i), 1);
      // console.log("end", this.splitArr)
      // this.groups[this.a] = this.splitArr;

    }

    // console.log("test", this.splitArr);
    // for (var p of this.groups[this.newTemplate]){
    //   p['EventTemplate'] = this.newTemplate;
    // }
    // console.log('groups', this.groups)

    for(let t of Object.keys(this.groups)){
      if((this.groups[t].length) == 0){
        console.log(t,this.groups[t],this.groups[t].length)
        delete this.groups[t]
        
      }
    }

    this.pieChartLabels = Object.keys(this.groups);
    
    for (var j of this.pieChartLabels) {
      this.pieChartData.push(this.groups[j].length)
    }
    // for (var x of this.pieChartLabels) {
    //   this.headlines.push(this.groups[x][0]['EventId'])
    // }
    this.generateRgb(this.pieChartData.length);

    console.log("groups",this.groups)
    
    this.selectedLogs = [];
    this.a = '';
  }

  saveEdits(){
    this.dataService.save(this.groups,this.fileName).subscribe((data) => {
        console.log("saveEdits: ", data);
        if (data){
          this.saved = true;
        }

    });
    setTimeout(()=>{                           //<<<---using ()=> syntax
          this.saved = false;
    }, 3000);
  }
}
