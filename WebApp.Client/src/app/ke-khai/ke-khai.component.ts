export class KeKhaiComponent implements OnInit {
  daiLys: any[] = [];

  constructor(
    private daiLyService: DaiLyService // Thêm service
  ) {}

  ngOnInit() {
    this.loadDaiLys();
  }

  loadDaiLys() {
    this.daiLyService.getDaiLys().subscribe({
      next: (data) => {
        this.daiLys = data;
      },
      error: (error) => {
        this.message.error('Không thể tải danh sách đại lý');
      }
    });
  }

  initDotKeKhaiForm(): void {
    this.dotKeKhaiForm = this.fb.group({
      tenDotKeKhai: ['', [Validators.required]],
      ngayBatDau: [null, [Validators.required]],
      ngayKetThuc: [null, [Validators.required]],
      daiLyId: [null, [Validators.required]],
      ghiChu: ['']
    });
  }
} 