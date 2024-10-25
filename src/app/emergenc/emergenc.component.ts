import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { ChangeDetectorRef, Component, inject, OnInit, ViewChild, } from '@angular/core';
import { RouterOutlet, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { ReactiveFormsModule, FormsModule, FormBuilder, FormGroup, UntypedFormBuilder, UntypedFormGroup, Validators} from '@angular/forms';
import { PoModule, PoTableColumn, PoTableModule, PoButtonModule, PoMenuItem, PoMenuModule, PoModalModule, PoPageModule, PoToolbarModule, PoTableAction, PoModalAction, PoDialogService, PoNotificationService, PoFieldModule, PoDividerModule, PoTableLiterals,} from '@po-ui/ng-components';
import { ServerTotvsService } from '../services/server-totvs.service';
import { ExcelService } from '../services/excel-service.service';
import { escape } from 'querystring';


@Component({
  selector: 'app-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    ReactiveFormsModule,
    FormsModule,
    PoModalModule,
    PoTableModule,
    PoModule,
    PoFieldModule,
    PoDividerModule,
    PoButtonModule,
    PoToolbarModule,
    PoMenuModule,
    PoPageModule,
    HttpClientModule,
  ],
  templateUrl: './emergenc.component.html',
  styleUrl: './emergenc.component.css'
})
export class EmergencComponent {

  private srvTotvs = inject(ServerTotvsService);
  private srvNotification = inject(PoNotificationService);
  private srvExcel = inject(ExcelService);
  private srvDialog = inject(PoDialogService);
  private router = inject(Router)
  private formEmergencial = inject(FormBuilder);

  //Variaveis 
  labelLoadTela:string = ''
  loadTela: boolean = false
  loadExcel:boolean = false
  tituloTela!:string
  mudaCampos!:number | null
  registros!: any[];
  pesquisa!:string
  nomeBotao: any;
  lBotao:boolean = false
  alturaGrid:number=window.innerHeight - 295

  //lista: any;
  tipoAcao:string=''
  
  //---Grid
  colunas!: PoTableColumn[]
  lista!: any[]
   customLiterals: PoTableLiterals = {
    noData: 'Infome os filtros para Buscar os Dados'
  };
  
  /*
  changeBuscaEmerg(event: any) {
    
    this.lista = []
    this.form.controls['tpBusca'].setValue (event)
   
    //alert (this.form.controls['tpBusca'].value)

    this.mudaCampos = this.form.controls['tpBusca'].value

    if (this.form.controls['tpBusca'].value == 1) { //Ambos
      this.form.reset()
      this.pesquisa = "ATIVOS E INATIVOS" //+ this.form.controls['itCodigo'].value
    }
    else if (this.form.controls['tpBusca'].value == 2) { //Sim
      this.form.reset()
      this.pesquisa = "ATIVOS" //+ this.form.controls['itCodigo'].value
    }
    else { //Nao
      this.form.reset()
      this.pesquisa = "INATIVOS" //+ this.form.controls['codEstabel'].value + ' - '+ this.form.controls['codFilial'].value + ' - ' + this.form.controls['numRR'].value
    }
    
  }
  */
  //--- Actions
  readonly opcoesGrid: PoTableAction[] = [
    {
      separator:true,
      label: '',
      icon: 'bi bi-trash',
      action: this.onDeletar.bind(this),
      type:'danger'
    }];

  //Formulario
  public form = this.formEmergencial.group({
    itCodigoini: [''],
    itCodigofim: [''],
    //tpBusca: [1, Validators.required],
  });
  
  readonly acaoSalvar: PoModalAction = {
    label: 'Salvar',
    action: () => { this.onSalvar() }
  }

  readonly acaoCancelar: PoModalAction = {
    label: 'Cancelar',
    action: () => { //this.cadModal?.close()
       }
  }
  formBuilder: any;
  nomeEstabel: string | undefined;
  valorForm: any;

  ngOnInit(): void {
    
    this.form.controls['itCodigofim'].setValue("ZZZZZZZZZZZZZZZZ")
    //Colunas do grid
    this.colunas = this.srvTotvs.obterColunasEmergencial()
    this.mudaCampos = 1 //iniciar a variavel
    this.pesquisa = "ATIVOS E INATIVOS"
    
  }

  ConsultaPrioridade(){

    this.router.navigate(['list'])

  }

  private totalLabelAtivos() {

    let colunaSituacao = this.colunas.findIndex(col => col.property === 'Ativo')   //nome do campo
    let labelsSituacao = this.colunas[colunaSituacao].subtitles as any[]

    labelsSituacao.forEach(itens => {
      //item.label = item.label + ' (' + this.registros.filter(data => data.cSituacao === item.value).length + ')'
      itens.label = itens.label.split('(')[0] + ' (' + this.lista.filter(data => data.Ativo === itens.value).length + ')'
    })

  }

  ChamaObterEmergencial(){
    this.labelLoadTela = "Carregando Emergenciais"
    this.loadTela = true;
    this.desabilitaForm()
    let paramsTela: any = { items: this.form.value }
    console.log(paramsTela)
    this.lista = []   
    
    //Chamar o servico
    this.srvTotvs.ObterEmergencial(paramsTela).subscribe({
      next: (response: any) => {
        
        this.srvNotification.success('Dados listados com sucesso !')
        this.lista = response.items
        this.loadTela = false
        this.totalLabelAtivos()
        this.lista.sort(this.srvTotvs.ordenarCampos(['Inclusao']))
        
        this.habilitaForm()
       
      },
      error: (e) => {
        //this.srvNotification.error('Ocorreu um erro ObterBRR: ' + e)
        this.loadTela = false
        this.habilitaForm()
      },
    })    
  }

  public habilitaForm(){    
    this.lBotao = false
    this.form.controls['itCodigofim'].enable()
    this.form.controls['itCodigoini'].enable()
  }

  public desabilitaForm(){
    this.lBotao = true    
    this.form.controls['itCodigofim'].disable()
    this.form.controls['itCodigoini'].disable()
  }
  //---------------------------------------------------------------- Exportar lista detalhe para excel
  public onExportarExcel(){
    let titulo = "BANCO DE REPAROS" //this.tituloTela.split(':')[0]
    let subTitulo = "CONSULTA DE EMERGENCIAL" //this.tituloTela.split(':')[1]
    this.loadExcel = true

    let valorForm: any = { valorForm: this.form.value }
    
    this.srvExcel.exportarParaExcel('CONSULTA DE ' + titulo.toUpperCase(),
                                    subTitulo.toUpperCase(),
                                    this.colunas,
                                    this.lista,
                                    'Lista_EMERG',
                                    'Plan1')
     this.loadExcel = false;
  }
  //---Listar registros grid
  listar() {
    this.loadTela = true;

    this.srvTotvs.Obter().subscribe({
      next: (response: any) => {
        if (response === null) return
        this.lista = response.items 
        this.loadTela = false
      },
      error: (e) => {
                    this.srvNotification.error("Erro ao chamar Obter Lista:" + e)
                    this.loadTela=false},
    });
  }

  //Chama tela do TOTVS
  public AbrirTelaTOTVS(programa: string): void {
    let params: any = { program: programa, params: '' };
    this.srvTotvs.AbrirTelaTOTVS(params).subscribe({
      next: (response: any) => {},
      error: (e) => {
        this.loadTela = false;
        //mensagem pro usuario
        this.srvNotification.error("Erro ao chamar AbrirTelaTOTV:" + e)
      },
    });
  }

  //---Novo registro
  onNovo() {
    
    //Criar um registro novo passando 0 o ID
    this.router.navigate(['form/0']) 
    
  }

  //---Deletar registro
  onDeletar(obj: any | null) {
    let paramTela:any={codEstabel:obj.codEstabel}
    
    this.srvDialog.confirm({
      title: "DELETAR REGISTRO",
      message: `Confirma deleção do registro: ${obj.nomeEstabel} ?`,
      confirm: () => {
        this.loadTela = true
        this.srvTotvs.Deletar(paramTela).subscribe({
          next: (response: any) => {
            this.srvNotification.success('Registro eliminado com sucesso')
            this.listar()
          },
          error: (e) => {
            this.loadTela = false
            this.srvNotification.error('Ocorreu um erro na requisição, o registro não foi eliminado')
          }
        })
      },
      cancel: () => this.srvNotification.error("Cancelada pelo usuário")
    })
  }

  //---Salvar Registro
  onSalvar(){


  }

}
