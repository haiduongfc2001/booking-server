import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  Model,
  Table,
} from "sequelize-typescript";
import { Hotel } from "./Hotel";
import { TABLE_NAME } from "../config/constant.config";

@Table({
  tableName: TABLE_NAME.POLICY,
})
export class Policy extends Model {
  @Column({
    type: DataType.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  })
  id!: number;

  @ForeignKey(() => Hotel)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  hotel_id!: number;

  @BelongsTo(() => Hotel)
  hotel!: Hotel;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  type!: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  value!: string;

  @Column({
    type: DataType.TEXT,
    allowNull: false,
  })
  description!: string;
}

/**
 * Đối với type là refund (hoàn tiên) thì tùy theo chính sách của từng khách sạn mà có những chinh sách hoàn tiền khác nhau
    Dưới đây là một số tùy chọn phổ biến cho chính sách hoàn tiền:
      1. Full: Hoàn tiền toàn bộ.
      2. Partial: Hoàn tiền một phần, thường đi kèm với tỷ lệ phần trăm hoặc số tiền cụ thể.
      3. Non-refundable: Không hoàn tiền.
      4. Time-based Refund: Hoàn tiền dựa trên thời gian hủy, ví dụ:
            +) 100% hoàn tiền nếu hủy trước 48 giờ.
            +) 50% hoàn tiền nếu hủy trong vòng 24-48 giờ.
            +) Không hoàn tiền nếu hủy trong vòng 24 giờ.
 */

// ===========================================================================================
// Đối với chính sách hoàn tiền (refund policy) trong khách sạn, bạn có thể có nhiều tùy chọn khác nhau để phản ánh các tình huống khác nhau và điều kiện cụ thể. Dưới đây là một số tùy chọn phổ biến cho chính sách hoàn tiền:

// 1. **Full Refund**: Hoàn tiền đầy đủ.
//    - **Value**: `full`
//    - **Description**: Hoàn tiền đầy đủ nếu hủy trước thời hạn quy định.

// 2. **Partial Refund**: Hoàn tiền một phần.
//    - **Value**: `partial`
//    - **Description**: Hoàn tiền một phần nếu hủy trong một khoảng thời gian nhất định trước khi nhận phòng.
//    - **Details**: Có thể chi tiết thêm về phần trăm hoặc số tiền hoàn lại cụ thể (ví dụ: 50%, 75%, hoặc một số tiền cụ thể).

// 3. **No Refund**: Không hoàn tiền.
//    - **Value**: `none`
//    - **Description**: Không hoàn tiền nếu hủy phòng sau một thời hạn nhất định.

// 4. **Sliding Scale Refund**: Hoàn tiền dựa trên thời gian hủy.
//    - **Value**: `sliding`
//    - **Description**: Hoàn tiền theo thang tỷ lệ dựa trên thời gian hủy trước ngày nhận phòng.
//    - **Details**: Có thể chi tiết về tỷ lệ hoàn tiền giảm dần (ví dụ: 100% nếu hủy trước 30 ngày, 50% nếu hủy trước 15 ngày, v.v.).

// 5. **Conditional Refund**: Hoàn tiền có điều kiện.
//    - **Value**: `conditional`
//    - **Description**: Hoàn tiền tùy thuộc vào các điều kiện cụ thể như lý do hủy, tình trạng khẩn cấp, hoặc các điều kiện đặc biệt khác.

// ### Ví dụ Cụ thể

// Dưới đây là một số ví dụ cụ thể về cách thêm các tùy chọn hoàn tiền vào bảng `policy`:

// ```sql
// INSERT INTO policy (hotel_id, type, value, description, created_at, updated_at) VALUES
// (1, 'refund', 'full', 'Hoàn tiền đầy đủ nếu hủy trước 24 giờ', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
// (1, 'refund', 'partial', 'Hoàn lại 50% nếu hủy trước 12 giờ', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
// (1, 'refund', 'none', 'Không hoàn tiền nếu hủy sau 12 giờ', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
// (1, 'refund', 'sliding', 'Hoàn lại 100% nếu hủy trước 30 ngày, 50% nếu hủy trước 15 ngày', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
// (1, 'refund', 'conditional', 'Hoàn tiền nếu có lý do khẩn cấp, yêu cầu giấy tờ chứng minh', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
// ```

// ### Giải thích:

// - **full**: Hoàn tiền đầy đủ khi hủy trước 24 giờ.
// - **partial**: Hoàn lại 50% khi hủy trước 12 giờ.
// - **none**: Không hoàn tiền khi hủy sau 12 giờ.
// - **sliding**: Hoàn lại theo tỷ lệ, 100% nếu hủy trước 30 ngày và 50% nếu hủy trước 15 ngày.
// - **conditional**: Hoàn tiền có điều kiện dựa trên lý do hủy.

// Các tùy chọn này giúp khách sạn linh hoạt hơn trong việc thiết lập chính sách hoàn tiền, đồng thời giúp khách hàng hiểu rõ hơn về quyền lợi của họ khi hủy phòng.

// ===========================================================================================
/** 
 * Đối với trường hợp phụ thu thêm đối với người ở thêm 
 * Khách sạn có chính sách phụ thu đối với trẻ em muốn ở thêm. 
 * Từ 0-8 miễn phí, 9-13 phụ thu 10%, 14-17 phụ thu 20%.
 * Phòng có số khách tiêu chuẩn là 2 người. Số người lớn tối đa là 2. Số trẻ em tối đa là 2.
 * Số người tối đa phòng có thể chứa là 4.
 * Có thể phụ thu thêm nếu số vượt quá 2. Phòng có giá 100$/đêm. 
 * Đoàn khách có 2 người lớn, muốn ở thêm:
 *    TH1: 1 trẻ em
 *       1.1. Trẻ 5 tuổi ==> 0$
 *       1.2. Trẻ 10 tuổi ==> 10$
 *       1.3. Trẻ 15 tuổi ==> 20$
 *    TH2: 2 trẻ em
 *       1.1. Trẻ 5 tuổi và 4 tuổi ==> 0$
 *       1.2. Trẻ 5 tuổi  và 10 tuổi ==> 10$
 *       1.3. Trẻ 5 tuổi  và 14 tuổi ==> 20$
 *       1.4. Trẻ 10 tuổi  và 10 tuổi ==> 20$
 *       1.5. Trẻ 10 tuổi  và 14 tuổi ==> 30$
 *       1.6. Trẻ 15 tuổi  và 14 tuổi ==> 40$
 */