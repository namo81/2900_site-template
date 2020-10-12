function PlugBasic(option){
    this.name = option.name;
    this.date = option.date;
    this.testPrint = function(){
        console.log(this.name, this.date);
    }

    this.testPrint();
}